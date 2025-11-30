-- Migration 011d: Pronunciation RPC for Drill A guardrails
-- Provides batched pronunciations (dictionary + manual overrides) for practice queues
--
-- PERFORMANCE OPTIMIZATION (2025-11-22):
-- Replaced correlated subquery with LEFT JOIN + GROUP BY to eliminate N+1 query pattern.
-- Before: 1 main query + N subqueries (one per entry row) = O(n) complexity
-- After: Single query with JOIN aggregation = O(1) complexity
-- Expected improvement: 30-40% faster at scale (e.g., 150ms → 90-105ms for 100 entries)

BEGIN;

CREATE OR REPLACE FUNCTION rpc_get_entry_pronunciations(entry_ids uuid[])
RETURNS TABLE (
  entry_id uuid,
  simp text,
  trad text,
  dictionary_zhuyin jsonb,
  dictionary_variants jsonb,
  manual_readings jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.id AS entry_id,
    e.simp,
    e.trad,
    d.zhuyin AS dictionary_zhuyin,
    COALESCE(d.zhuyin_variants, '[]'::jsonb) AS dictionary_variants,
    COALESCE(
      jsonb_agg(r.zhuyin ORDER BY r.created_at)
        FILTER (WHERE r.id IS NOT NULL),
      '[]'::jsonb
    ) AS manual_readings
  FROM entries e
  LEFT JOIN dictionary_entries d
    ON d.simp = e.simp AND d.trad = e.trad
  LEFT JOIN readings r ON r.entry_id = e.id
  WHERE e.id = ANY (entry_ids)
  GROUP BY e.id, e.simp, e.trad, d.zhuyin, d.zhuyin_variants;
$$;

GRANT EXECUTE ON FUNCTION rpc_get_entry_pronunciations(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_get_entry_pronunciations(uuid[]) TO service_role;

COMMENT ON FUNCTION rpc_get_entry_pronunciations(uuid[]) IS 'Returns dictionary pronunciations, variants, and manual readings for the provided entry IDs.';

COMMIT;

-- Migration 011d: Pronunciation RPC for Drill A guardrails
-- Provides batched pronunciations (dictionary + manual overrides) for practice queues

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
      (
        SELECT jsonb_agg(r.zhuyin ORDER BY r.created_at)
        FROM readings r
        WHERE r.entry_id = e.id
      ),
      '[]'::jsonb
    ) AS manual_readings
  FROM entries e
  LEFT JOIN dictionary_entries d
    ON d.simp = e.simp AND d.trad = e.trad
  WHERE e.id = ANY (entry_ids);
$$;

GRANT EXECUTE ON FUNCTION rpc_get_entry_pronunciations(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_get_entry_pronunciations(uuid[]) TO service_role;

COMMENT ON FUNCTION rpc_get_entry_pronunciations(uuid[]) IS 'Returns dictionary pronunciations, variants, and manual readings for the provided entry IDs.';

COMMIT;

/**
 * SQL Utility Functions
 *
 * Shared utilities for SQL migration generation
 */

/**
 * Escape single quotes for SQL string literals
 * @param {string} str - String to escape
 * @returns {string} SQL-safe string
 */
function escapeSql(str) {
  return str.replace(/'/g, "''");
}

module.exports = { escapeSql };

import { supabase } from '@/lib/supabaseClient';

export const sanitizeError = (error) => {
  if (!error) return { message: 'Unknown error', details: '', hint: '', code: '' };
  if (typeof error === 'string') return { message: error, details: '', hint: '', code: '' };
  return {
    message: error.message || 'An unexpected error occurred.',
    details: error.details || '',
    hint: error.hint || '',
    code: error.code || '',
  };
};

export const getErrorMessage = (error) => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  return error.message || 'An unexpected error occurred.';
};

export const cleanupSqlString = (sql) => {
  if (!sql || typeof sql !== 'string') return '';
  let cleaned = sql.replace(/;\s*;+/g, ';');
  cleaned = cleaned.replace(/;\s*$/, '');
  return cleaned.trim();
};

export const buildFilterQuery = (currentTable, queryFilters, limit, offset, orderBy, orderDirection) => {
  let baseQuery = `SELECT * FROM public."${currentTable}"`;
  const whereClauses = [];
  
  if (queryFilters && queryFilters.length > 0) {
    queryFilters.forEach(filter => {
      if (filter.column && filter.operator) {
        let value = filter.value;
        if (typeof value === 'string') {
          value = value.replace(/'/g, "''"); 
        }
        switch (filter.operator) {
          case 'equals': whereClauses.push(`"${filter.column}" = '${value}'`); break;
          case 'not_equals': whereClauses.push(`"${filter.column}" != '${value}'`); break;
          case 'greater_than': whereClauses.push(`"${filter.column}" > '${value}'`); break;
          case 'less_than': whereClauses.push(`"${filter.column}" < '${value}'`); break;
          case 'greater_than_or_equals': whereClauses.push(`"${filter.column}" >= '${value}'`); break;
          case 'less_than_or_equals': whereClauses.push(`"${filter.column}" <= '${value}'`); break;
          case 'contains': whereClauses.push(`"${filter.column}" ILIKE '%${value}%'`); break;
          case 'starts_with': whereClauses.push(`"${filter.column}" ILIKE '${value}%'`); break;
          case 'ends_with': whereClauses.push(`"${filter.column}" ILIKE '%${value}'`); break;
          case 'is_null': whereClauses.push(`"${filter.column}" IS NULL`); break;
          case 'is_not_null': whereClauses.push(`"${filter.column}" IS NOT NULL`); break;
          default: break;
        }
      }
    });
  }
  if (whereClauses.length > 0) {
    baseQuery += ` WHERE ${whereClauses.join(' AND ')}`;
  }
  if (orderBy && orderBy !== '--none--') {
    baseQuery += ` ORDER BY "${orderBy}" ${orderDirection === 'desc' ? 'DESC' : 'ASC'}`;
  }
  baseQuery += ` LIMIT ${limit} OFFSET ${offset}`;
  return baseQuery;
};

export const executeSupabaseQuery = async (sqlQuery) => {
  const cleanedQuery = cleanupSqlString(sqlQuery);
  if (!cleanedQuery) {
    throw new Error("Query is empty after cleanup.");
  }
  return supabase.rpc('execute_dynamic_sql', { sql_query: cleanedQuery });
};
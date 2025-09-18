import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatColumnType(column) {
  if (!column || !column.data_type) return 'UNKNOWN';
  
  let displayType = column.data_type.toUpperCase();
  
  if (column.character_maximum_length) {
    displayType += `(${column.character_maximum_length})`;
  } else if (column.numeric_precision && column.numeric_scale !== null && column.numeric_scale !== undefined) {
    displayType += `(${column.numeric_precision}, ${column.numeric_scale})`;
  } else if (column.numeric_precision) {
    displayType += `(${column.numeric_precision})`;
  }
  
  if (column.udt_name && column.udt_name.startsWith('_')) {
    displayType += '[]'; // Indicate array type
  }
  
  return displayType;
}
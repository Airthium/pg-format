"use strict";
exports.__esModule = true;
var reserved_1 = require("./reserved");
var fmtPattern = {
    ident: 'I',
    literal: 'L',
    string: 's'
};
/**
 * Convert to Postgres default ISO 8601 format
 * @param date JS format date
 * @returns ISO 8601 format date
 */
var formatDate = function (date) {
    date = date.replace('T', ' ');
    date = date.replace('Z', '+00');
    return date;
};
/**
 * Check if it is a reserved word
 * @param value Value
 * @returns Reserved
 */
var isReserved = function (value) {
    if (reserved_1["default"][value.toUpperCase()])
        return true;
    return false;
};
/**
 * Convert array to Postgres list
 * @param useSpace Use space
 * @param arrayA Array
 * @param formatter Formatter
 * @returns SQL list
 */
var arrayToList = function (useSpace, array, formatter) {
    var sql = useSpace ? ' ' : '';
    sql += '(';
    for (var index = 0; index < array.length; index++) {
        var item = array[index];
        sql += index === 0 ? '' : ', ';
        sql += formatter(item);
    }
    sql += ')';
    return sql;
};
/**
 * Quote ident
 * Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
 * @param value Value
 * @returns Quoted ident
 */
var quoteIdent = function (value) {
    if (value === undefined || value === null) {
        throw new Error('SQL identifier cannot be null or undefined');
    }
    else if (value === false) {
        return '"f"';
    }
    else if (value === true) {
        return '"t"';
    }
    else if (value instanceof Date) {
        return '"' + formatDate(value.toISOString()) + '"';
    }
    else if (value instanceof Buffer) {
        throw new Error('SQL identifier cannot be a buffer');
    }
    else if (Array.isArray(value) === true) {
        var temp = [];
        for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
            var val = value_1[_i];
            if (Array.isArray(val) === true) {
                throw new Error('Nested array to grouped list conversion is not supported for SQL identifier');
            }
            else {
                temp.push(quoteIdent(val));
            }
        }
        return temp.toString();
    }
    else if (value === Object(value)) {
        throw new Error('SQL identifier cannot be an object');
    }
    var ident = value.toString().slice(0); // create copy
    // do not quote a valid, unquoted identifier
    if (/^[a-z_][a-z0-9_$]*$/.test(ident) === true &&
        isReserved(ident) === false) {
        return ident;
    }
    var quoted = '"';
    for (var _a = 0, ident_1 = ident; _a < ident_1.length; _a++) {
        var id = ident_1[_a];
        if (id === '"') {
            quoted += id + id;
        }
        else {
            quoted += id;
        }
    }
    quoted += '"';
    return quoted;
};
/**
 * Quote literal
 * Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
 * @param value Value
 * @returns Quoted literal
 */
var quoteLiteral = function (value) {
    var literal = null;
    var explicitCast = null;
    if (value === undefined || value === null) {
        return 'NULL';
    }
    else if (value === false) {
        return "'f'";
    }
    else if (value === true) {
        return "'t'";
    }
    else if (value instanceof Date) {
        return "'" + formatDate(value.toISOString()) + "'";
    }
    else if (value instanceof Buffer) {
        return "E'\\\\x" + value.toString('hex') + "'";
    }
    else if (Array.isArray(value) === true) {
        var temp = [];
        for (var index = 0; index < value.length; index++) {
            var val = value[index];
            if (Array.isArray(val) === true) {
                temp.push(arrayToList(index !== 0, val, quoteLiteral));
            }
            else {
                temp.push(quoteLiteral(val));
            }
        }
        return temp.toString();
    }
    else if (value === Object(value)) {
        explicitCast = 'jsonb';
        literal = JSON.stringify(value);
    }
    else {
        literal = value.toString().slice(0); // create copy
    }
    var hasBackslash = false;
    var quoted = "'";
    for (var _i = 0, literal_1 = literal; _i < literal_1.length; _i++) {
        var lit = literal_1[_i];
        if (lit === "'") {
            quoted += lit + lit;
        }
        else if (lit === '\\') {
            quoted += lit + lit;
            hasBackslash = true;
        }
        else {
            quoted += lit;
        }
    }
    quoted += "'";
    if (hasBackslash === true) {
        quoted = 'E' + quoted;
    }
    if (explicitCast) {
        quoted += '::' + explicitCast;
    }
    return quoted;
};
/**
 * Quote string
 * @param value Value
 * @returns QUoted string
 */
var quoteString = function (value) {
    if (value === undefined || value === null) {
        return '';
    }
    else if (value === false) {
        return 'f';
    }
    else if (value === true) {
        return 't';
    }
    else if (value instanceof Date) {
        return formatDate(value.toISOString());
    }
    else if (value instanceof Buffer) {
        return '\\x' + value.toString('hex');
    }
    else if (Array.isArray(value) === true) {
        var temp = [];
        for (var index = 0; index < value.length; index++) {
            var val = value[index];
            if (val !== null && val !== undefined) {
                if (Array.isArray(val) === true) {
                    temp.push(arrayToList(index !== 0, val, quoteString));
                }
                else {
                    temp.push(quoteString(val));
                }
            }
        }
        return temp.toString();
    }
    else if (value === Object(value)) {
        return JSON.stringify(value);
    }
    return value.toString().slice(0); // return copy
};
/**
 * Format
 * @param fmt
 * @param parameters Parameters
 * @returns Query
 */
var format = function (fmt) {
    var parameters = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        parameters[_i - 1] = arguments[_i];
    }
    var index = 0;
    var regex = '%(%|(\\d+\\$)?[';
    regex += fmtPattern.ident;
    regex += fmtPattern.literal;
    regex += fmtPattern.string;
    regex += '])';
    var re = new RegExp(regex, 'g');
    return fmt.replace(re, function (_, type) {
        if (type === '%') {
            return '%';
        }
        var position = index;
        var tokens = type.split('$');
        if (tokens.length > 1) {
            position = parseInt(tokens[0]) - 1;
            type = tokens[1];
        }
        if (position < 0) {
            throw new Error('specified argument 0 but arguments start at 1');
        }
        else if (position > parameters.length - 1) {
            throw new Error('too few arguments');
        }
        index = position + 1;
        if (type === fmtPattern.ident) {
            return quoteIdent(parameters[position]);
        }
        else if (type === fmtPattern.literal) {
            return quoteLiteral(parameters[position]);
        }
        else if (type === fmtPattern.string) {
            return quoteString(parameters[position]);
        }
    });
};
exports["default"] = format;

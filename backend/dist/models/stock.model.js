"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
class StockModel {
    /**
     * Create a new stock
     */
    async create(stockData) {
        const { symbol, company_name, sector_id = null, logo_url = null, website_url = null, description = null, founded_year = null, market_cap = null } = stockData;
        const query = `
      INSERT INTO stocks (symbol, company_name, sector_id, logo_url, website_url, description, founded_year, market_cap)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
        const values = [
            symbol,
            company_name,
            sector_id,
            logo_url,
            website_url,
            description,
            founded_year,
            market_cap
        ];
        const result = await db_1.default.query(query, values);
        return result.rows[0];
    }
    /**
     * Find stock by ID
     */
    async findById(id) {
        const query = `
      SELECT s.*, sect.name as sector_name
      FROM stocks s
      LEFT JOIN sectors sect ON s.sector_id = sect.id
      WHERE s.id = $1
    `;
        const result = await db_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    /**
     * Find stock by symbol
     */
    async findBySymbol(symbol) {
        const query = `
      SELECT s.*, sect.name as sector_name
      FROM stocks s
      LEFT JOIN sectors sect ON s.sector_id = sect.id
      WHERE s.symbol = $1
    `;
        const result = await db_1.default.query(query, [symbol]);
        return result.rows[0] || null;
    }
    /**
     * Get all stocks with filters
     */
    async findAll(filters = {}) {
        const { sector_id, searchQuery, limit = 10, offset = 0 } = filters;
        let query = `
      SELECT s.*, sect.name as sector_name
      FROM stocks s
      LEFT JOIN sectors sect ON s.sector_id = sect.id
      WHERE 1 = 1
    `;
        let countQuery = `
      SELECT COUNT(*) as total
      FROM stocks s
      WHERE 1 = 1
    `;
        const values = [];
        let paramIndex = 1;
        // Add sector filter if provided
        if (sector_id) {
            query += ` AND s.sector_id = $${paramIndex}`;
            countQuery += ` AND s.sector_id = $${paramIndex}`;
            values.push(sector_id);
            paramIndex++;
        }
        // Add search filter if provided
        if (searchQuery) {
            query += ` AND (
        LOWER(s.symbol) LIKE LOWER($${paramIndex}) OR
        LOWER(s.company_name) LIKE LOWER($${paramIndex})
      )`;
            countQuery += ` AND (
        LOWER(s.symbol) LIKE LOWER($${paramIndex}) OR
        LOWER(s.company_name) LIKE LOWER($${paramIndex})
      )`;
            values.push(`%${searchQuery}%`);
            paramIndex++;
        }
        // Add pagination
        query += ` ORDER BY s.company_name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(limit, offset);
        // Execute queries
        const stocksResult = await db_1.default.query(query, values);
        const countResult = await db_1.default.query(countQuery, values.slice(0, -2));
        return {
            stocks: stocksResult.rows,
            total: parseInt(countResult.rows[0].total, 10)
        };
    }
    /**
     * Update stock
     */
    async update(id, stockData) {
        // Start building query
        let query = 'UPDATE stocks SET ';
        const values = [];
        let valueIndex = 1;
        // Add fields to update
        const updateFields = [];
        if (stockData.symbol !== undefined) {
            updateFields.push(`symbol = $${valueIndex++}`);
            values.push(stockData.symbol);
        }
        if (stockData.company_name !== undefined) {
            updateFields.push(`company_name = $${valueIndex++}`);
            values.push(stockData.company_name);
        }
        if (stockData.sector_id !== undefined) {
            updateFields.push(`sector_id = $${valueIndex++}`);
            values.push(stockData.sector_id);
        }
        if (stockData.logo_url !== undefined) {
            updateFields.push(`logo_url = $${valueIndex++}`);
            values.push(stockData.logo_url);
        }
        if (stockData.website_url !== undefined) {
            updateFields.push(`website_url = $${valueIndex++}`);
            values.push(stockData.website_url);
        }
        if (stockData.description !== undefined) {
            updateFields.push(`description = $${valueIndex++}`);
            values.push(stockData.description);
        }
        if (stockData.founded_year !== undefined) {
            updateFields.push(`founded_year = $${valueIndex++}`);
            values.push(stockData.founded_year);
        }
        if (stockData.market_cap !== undefined) {
            updateFields.push(`market_cap = $${valueIndex++}`);
            values.push(stockData.market_cap);
        }
        // Add updated_at timestamp
        updateFields.push(`updated_at = NOW()`);
        // If no fields to update, return null
        if (updateFields.length === 1) {
            return null;
        }
        // Complete the query
        query += updateFields.join(', ');
        query += ` WHERE id = $${valueIndex} RETURNING *`;
        values.push(id);
        const result = await db_1.default.query(query, values);
        return result.rows[0] || null;
    }
    /**
     * Delete stock
     */
    async delete(id) {
        const query = 'DELETE FROM stocks WHERE id = $1';
        const result = await db_1.default.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
exports.default = new StockModel();

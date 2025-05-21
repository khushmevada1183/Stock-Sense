-- Create database
CREATE DATABASE indian_stocks;

-- Connect to the database
\c indian_stocks

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create stock_data table for storing API responses (new)
CREATE TABLE stock_data (
  id SERIAL PRIMARY KEY,
  query VARCHAR(255) UNIQUE,
  data JSONB NOT NULL,
  fetched_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_query CHECK (query IS NOT NULL)
);

-- Create index for faster JSON queries (new)
CREATE INDEX idx_stock_data_query ON stock_data(query);
CREATE INDEX idx_stock_data_fetched_at ON stock_data(fetched_at);

-- Industry sectors
CREATE TABLE sectors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Companies/Stocks
CREATE TABLE stocks (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  sector_id INTEGER REFERENCES sectors(id),
  logo_url VARCHAR(255),
  website_url VARCHAR(255),
  description TEXT,
  founded_year INTEGER,
  market_cap BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Financial fundamentals
CREATE TABLE financial_data (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  fiscal_quarter INTEGER,
  revenue BIGINT,
  profit BIGINT,
  eps DECIMAL(10, 2),
  pe_ratio DECIMAL(10, 2),
  debt_to_equity DECIMAL(10, 2),
  profit_margin DECIMAL(10, 2),
  revenue_growth DECIMAL(10, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(stock_id, fiscal_year, fiscal_quarter)
);

-- Management information
CREATE TABLE management (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  since DATE,
  profile TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Industry analysis and trends
CREATE TABLE industry_trends (
  id SERIAL PRIMARY KEY,
  sector_id INTEGER REFERENCES sectors(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  quarter INTEGER,
  growth_rate DECIMAL(10, 2),
  market_size BIGINT,
  competition_level VARCHAR(50),
  trends TEXT,
  challenges TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(sector_id, year, quarter)
);

-- Government policies affecting stocks
CREATE TABLE government_policies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  announcement_date DATE NOT NULL,
  effective_date DATE,
  policy_type VARCHAR(100) NOT NULL,
  impact TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Link table for policies affecting specific sectors
CREATE TABLE policy_sector_impact (
  policy_id INTEGER REFERENCES government_policies(id) ON DELETE CASCADE,
  sector_id INTEGER REFERENCES sectors(id) ON DELETE CASCADE,
  impact_level VARCHAR(50) NOT NULL,
  details TEXT,
  PRIMARY KEY (policy_id, sector_id)
);

-- Macroeconomic indicators
CREATE TABLE macroeconomic_indicators (
  id SERIAL PRIMARY KEY,
  indicator_name VARCHAR(100) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  source VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(indicator_name, date)
);

-- News articles affecting stocks
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  source VARCHAR(255) NOT NULL,
  publication_date DATE NOT NULL,
  url VARCHAR(255),
  summary TEXT,
  sentiment VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Link table for news affecting specific stocks
CREATE TABLE stock_news (
  news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  impact_level VARCHAR(50),
  PRIMARY KEY (news_id, stock_id)
);

-- Technical analysis data
CREATE TABLE technical_data (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  open_price DECIMAL(10, 2) NOT NULL,
  high_price DECIMAL(10, 2) NOT NULL,
  low_price DECIMAL(10, 2) NOT NULL,
  close_price DECIMAL(10, 2) NOT NULL,
  volume BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(stock_id, date)
);

-- Growth potential indicators
CREATE TABLE growth_potential (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  expansion_plans TEXT,
  rd_investment BIGINT,
  market_opportunity TEXT,
  growth_score DECIMAL(3, 1),
  analyst_comments TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(stock_id, analysis_date)
);

-- Institutional investment data
CREATE TABLE institutional_investments (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  institution_name VARCHAR(255) NOT NULL,
  investment_type VARCHAR(50) NOT NULL,
  quarter INTEGER NOT NULL,
  year INTEGER NOT NULL,
  shares_held BIGINT,
  percentage_stake DECIMAL(5, 2),
  change_in_stake DECIMAL(5, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(stock_id, institution_name, year, quarter)
);

-- Market sentiment indicators
CREATE TABLE market_sentiment (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sentiment_score DECIMAL(3, 1),
  volume_change DECIMAL(10, 2),
  price_momentum DECIMAL(10, 2),
  retail_activity DECIMAL(10, 2),
  social_media_mentions INTEGER,
  analyst_recommendations VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(stock_id, date)
);

-- User watchlists
CREATE TABLE watchlists (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Stocks in watchlists
CREATE TABLE watchlist_stocks (
  watchlist_id INTEGER REFERENCES watchlists(id) ON DELETE CASCADE,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  notes TEXT,
  PRIMARY KEY (watchlist_id, stock_id)
);

-- User analysis notes
CREATE TABLE user_notes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Stock ratings (both from analysts and platform)
CREATE TABLE stock_ratings (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  rating_source VARCHAR(100) NOT NULL,
  rating_value VARCHAR(50) NOT NULL,
  rating_date DATE NOT NULL,
  price_target DECIMAL(10, 2),
  comments TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(stock_id, rating_source, rating_date)
);

-- Create indexes to optimize queries
CREATE INDEX idx_stocks_sector ON stocks(sector_id);
CREATE INDEX idx_financial_data_stock ON financial_data(stock_id);
CREATE INDEX idx_management_stock ON management(stock_id);
CREATE INDEX idx_technical_data_stock_date ON technical_data(stock_id, date);
CREATE INDEX idx_news_publication_date ON news(publication_date);
CREATE INDEX idx_institutional_investments_stock ON institutional_investments(stock_id);
CREATE INDEX idx_market_sentiment_stock_date ON market_sentiment(stock_id, date);
CREATE INDEX idx_watchlist_user ON watchlists(user_id);
CREATE INDEX idx_user_notes_user ON user_notes(user_id);
CREATE INDEX idx_user_notes_stock ON user_notes(stock_id);

-- Add audit trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all tables to update the updated_at timestamp
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_sectors_modtime BEFORE UPDATE ON sectors FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_stocks_modtime BEFORE UPDATE ON stocks FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_financial_data_modtime BEFORE UPDATE ON financial_data FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_management_modtime BEFORE UPDATE ON management FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_industry_trends_modtime BEFORE UPDATE ON industry_trends FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_government_policies_modtime BEFORE UPDATE ON government_policies FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_macroeconomic_indicators_modtime BEFORE UPDATE ON macroeconomic_indicators FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_news_modtime BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_technical_data_modtime BEFORE UPDATE ON technical_data FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_growth_potential_modtime BEFORE UPDATE ON growth_potential FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_institutional_investments_modtime BEFORE UPDATE ON institutional_investments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_market_sentiment_modtime BEFORE UPDATE ON market_sentiment FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_watchlists_modtime BEFORE UPDATE ON watchlists FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_user_notes_modtime BEFORE UPDATE ON user_notes FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_stock_ratings_modtime BEFORE UPDATE ON stock_ratings FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 
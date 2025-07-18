-- Add money_per_skin column to rounds table
ALTER TABLE rounds 
ADD COLUMN money_per_skin DECIMAL(10,2) DEFAULT 0;

-- Update the updated_at timestamp for tracking
UPDATE rounds SET updated_at = NOW() WHERE money_per_skin IS NULL;

-- Add a comment to document the field
COMMENT ON COLUMN rounds.money_per_skin IS 'Amount of money bet per skin in this round';

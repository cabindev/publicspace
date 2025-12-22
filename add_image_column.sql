-- Add image_url column to reports table
ALTER TABLE reports 
ADD COLUMN image_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN reports.image_url IS 'URL path to uploaded image file';
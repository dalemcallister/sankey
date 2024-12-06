-- Create the sankey_diagrams table
CREATE TABLE sankey_diagrams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nodes TEXT[] NOT NULL,
    links JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, name)
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sankey_diagrams_updated_at
    BEFORE UPDATE ON sankey_diagrams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE sankey_diagrams ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting diagrams
CREATE POLICY "Users can insert their own diagrams"
ON sankey_diagrams FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for selecting diagrams
CREATE POLICY "Users can view their own diagrams"
ON sankey_diagrams FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for updating diagrams
CREATE POLICY "Users can update their own diagrams"
ON sankey_diagrams FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy for deleting diagrams
CREATE POLICY "Users can delete their own diagrams"
ON sankey_diagrams FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_sankey_diagrams_user_id ON sankey_diagrams(user_id);
CREATE INDEX idx_sankey_diagrams_created_at ON sankey_diagrams(created_at DESC);
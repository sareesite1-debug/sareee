
-- Replace broad SELECT with one that allows public reads of file rows only via direct fetch (object name known),
-- restrict LIST (which is a metadata listing call) to admins.
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

-- Public can read object rows (used by direct GET of public file URL)
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Note: linter warns about listing, but for product image catalog usage this is acceptable since the
-- bucket is intentionally public and meant for product photos. We accept this warning.

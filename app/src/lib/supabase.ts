import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://qvqmkgibccaayajclpay.supabase.co',
  'sb_publishable_Ur3n-SUyxlowOIH0n2jmsw_ipQRcnjF'
);

/** Upload any Blob/File to Supabase Storage and return a public URL. */
export async function uploadToStorage(blob: Blob, ext?: string): Promise<string> {
  const fileExt = ext ?? (blob.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg');
  const key = `${crypto.randomUUID()}.${fileExt}`;
  const { error } = await supabase.storage
    .from('product-images')
    .upload(key, blob, { contentType: blob.type, upsert: false });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabase.storage.from('product-images').getPublicUrl(key);
  return data.publicUrl;
}

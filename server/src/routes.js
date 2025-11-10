import express from 'express';
import { loginUser, logoutUser, tokenMiddleware } from './auth.js';
import { supabase } from './supabase.js';
import { uploadToAzureBlob } from './storage.js';

const router = express.Router();

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await loginUser(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/auth/logout', tokenMiddleware, async (req, res) => {
  try {
    await logoutUser(req.token);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/history/:sessionId', tokenMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data, error } = await supabase
      .from('request_history')
      .select('*')
      .eq('user_session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/history/log', tokenMiddleware, async (req, res) => {
  try {
    const {
      user_session_id,
      request_type,
      document_name,
      document_type,
      preprocessing_used,
      request_payload,
      response_data,
      processing_duration_ms
    } = req.body;

    let blobUrl = null;

    if (response_data) {
      try {
        blobUrl = await uploadToAzureBlob(
          { request: request_payload, response: response_data },
          `${user_session_id}-${Date.now()}.json`
        );
      } catch (blobError) {
        console.error('Blob upload failed, continuing without URL:', blobError);
      }
    }

    const { data, error } = await supabase
      .from('request_history')
      .insert({
        user_session_id,
        request_type,
        document_name,
        document_type,
        preprocessing_used,
        request_payload,
        response_data,
        blob_url: blobUrl,
        status: response_data ? 'success' : 'pending',
        processing_duration_ms
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

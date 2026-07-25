import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Stack, Alert, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { listCategories, createCategory, deleteCategory } from '../../api/endpoints/admin';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => listCategories({ limit: 100 }).then((r) => setCategories(r?.data ?? [])).catch(() => setCategories([]));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setError('');
    setSaving(true);
    try {
      await createCategory({ name });
      setOpen(false);
      setName('');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not create category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await deleteCategory(id).catch(() => {});
    load();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Category</Button>
      </Stack>

      <Grid container spacing={2}>
        {categories.length === 0 && (
          <Grid item xs={12}>
            <Typography sx={{ color: 'text.secondary' }}>No categories yet — add your first one, or connect the backend.</Typography>
          </Grid>
        )}
        {categories.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{c.name}</Typography>
                <Chip label={c.isActive ? 'Active' : 'Inactive'} size="small" color={c.isActive ? 'success' : 'default'} sx={{ mt: 0.5 }} />
              </Box>
              <IconButton size="small" onClick={() => handleDelete(c.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField autoFocus fullWidth label="Category Name" value={name} onChange={(e) => setName(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={saving || !name} onClick={handleCreate}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

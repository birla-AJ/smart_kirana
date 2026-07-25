import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Stack, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { listAdmins, createAdminUser, deleteAdminUser, listRoles } from '../../api/endpoints/admin';

const EMPTY = { firstName: '', lastName: '', email: '', mobile: '', password: '', roleId: '', designation: '' };

export default function AdminUsers() {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => listAdmins({ limit: 50 }).then((r) => setAdmins(r?.data ?? [])).catch(() => setAdmins([]));

  useEffect(() => {
    load();
    listRoles().then((r) => setRoles((r?.data ?? []).filter((x) => x.name !== 'CUSTOMER'))).catch(() => {});
  }, []);

  const handleCreate = async () => {
    setError('');
    setSaving(true);
    try {
      await createAdminUser(form);
      setOpen(false);
      setForm(EMPTY);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not create admin');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this admin user?')) return;
    await deleteAdminUser(id).catch(() => {});
    load();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Admin Users</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Admin</Button>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f4f7f5' }}>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                No admin users yet — connect the backend or add your first admin.
              </TableCell></TableRow>
            ) : admins.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.firstName} {a.lastName || ''}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell>{a.designation || '—'}</TableCell>
                <TableCell><Chip label={a.role?.name || a.roleName} size="small" /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleDelete(a.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Admin User</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField label="First Name" fullWidth value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <TextField label="Last Name" fullWidth value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </Stack>
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <TextField select label="Role" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
              {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </TextField>
            <TextField label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={handleCreate}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

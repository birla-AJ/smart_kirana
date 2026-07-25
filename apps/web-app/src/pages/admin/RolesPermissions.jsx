import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Stack, Chip, Checkbox, Button, MenuItem, TextField, Alert,
} from '@mui/material';
import { listRoles, listPermissionsGrouped, updateRolePermissions } from '../../api/endpoints/admin';

export default function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [checked, setChecked] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    listRoles().then((r) => setRoles(r?.data ?? []));
    listPermissionsGrouped().then((r) => setGrouped(r?.data ?? {}));
  }, []);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  useEffect(() => {
    if (selectedRole?.permissions) {
      setChecked(new Set(selectedRole.permissions.map((p) => p.name)));
    } else {
      setChecked(new Set());
    }
  }, [selectedRoleId]);

  const toggle = (name) => {
    const next = new Set(checked);
    next.has(name) ? next.delete(name) : next.add(name);
    setChecked(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateRolePermissions(selectedRoleId, Array.from(checked));
      setMessage('Permissions updated successfully.');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Could not update permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Roles & Permissions</Typography>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <TextField
          select
          label="Select Role"
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          sx={{ minWidth: 260 }}
        >
          {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
        </TextField>
      </Paper>

      {selectedRoleId && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
          {Object.entries(grouped).map(([module, perms]) => (
            <Box key={module} sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: 700, mb: 1, textTransform: 'capitalize' }}>{module}</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {perms.map((p) => (
                  <Chip
                    key={p.id}
                    label={p.action}
                    clickable
                    onClick={() => toggle(p.name)}
                    color={checked.has(p.name) ? 'primary' : 'default'}
                    variant={checked.has(p.name) ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
            </Box>
          ))}
          <Button variant="contained" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save Permissions'}
          </Button>
        </Paper>
      )}
    </Box>
  );
}

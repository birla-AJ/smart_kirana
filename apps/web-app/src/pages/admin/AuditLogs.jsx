import { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Chip } from '@mui/material';
import { listAuditLogs } from '../../api/endpoints/admin';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    listAuditLogs({ limit: 50 }).then((r) => setLogs(r?.data ?? [])).catch(() => setLogs([]));
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Audit Logs</Typography>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f4f7f5' }}>
              <TableCell>Action</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                No activity recorded yet — every create/update/delete across the panel gets logged here automatically.
              </TableCell></TableRow>
            ) : logs.map((l, i) => (
              <TableRow key={i}>
                <TableCell><Chip label={l.action} size="small" /></TableCell>
                <TableCell>{l.module}</TableCell>
                <TableCell>{l.description || '—'}</TableCell>
                <TableCell>{l.ipAddress || '—'}</TableCell>
                <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

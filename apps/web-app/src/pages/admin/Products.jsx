import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Stack, Switch, FormControlLabel, Alert, Divider, Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  listProducts, createProduct, updateProduct, deleteProduct, listCategories, listProductUnits,
  getProductById, uploadImage, addProductImage, removeProductImage, setPrimaryProductImage,
  addProductVariant, updateProductVariant, removeProductVariant,
} from '../../api/endpoints/admin';

const EMPTY = {
  categoryId: '', name: '', sku: '', description: '', isVeg: true, status: 'ACTIVE',
  unitId: '', variantName: '', variantSku: '', mrp: '', sellingPrice: '', initialStock: 0,
};
const EMPTY_VARIANT = { unitId: '', name: '', sku: '', mrp: '', sellingPrice: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newVariant, setNewVariant] = useState(EMPTY_VARIANT);
  const [addingVariant, setAddingVariant] = useState(false);

  const load = () => {
    listProducts({ limit: 50 }).then((r) => setProducts(r?.data ?? [])).catch(() => setProducts([]));
  };

  useEffect(() => {
    load();
    listCategories({ limit: 100 }).then((r) => setCategories(r?.data ?? [])).catch(() => {});
    listProductUnits().then((r) => setUnits(r?.data ?? [])).catch(() => {});
  }, []);

  const refreshEditingProduct = async (id) => {
    const r = await getProductById(id).catch(() => null);
    setEditingProduct(r?.data ?? r ?? null);
  };

  const openCreate = () => {
    setEditingId(null);
    setEditingProduct(null);
    setForm(EMPTY);
    setError('');
    setOpen(true);
  };

  const openEdit = async (p) => {
    setEditingId(p.id);
    setForm({
      ...EMPTY,
      categoryId: p.categoryId || '',
      name: p.name,
      sku: p.sku,
      description: p.description || '',
      isVeg: p.isVeg,
      status: p.status,
    });
    setError('');
    setNewVariant(EMPTY_VARIANT);
    setOpen(true);
    await refreshEditingProduct(p.id);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await updateProduct(editingId, {
          categoryId: form.categoryId || undefined,
          name: form.name,
          description: form.description,
          status: form.status,
          isVeg: form.isVeg,
        });
        setOpen(false);
      } else {
        await createProduct({
          categoryId: form.categoryId,
          name: form.name,
          sku: form.sku,
          description: form.description,
          isVeg: form.isVeg,
          initialStock: Number(form.initialStock) || 0,
          variants: [{
            unitId: form.unitId,
            name: form.variantName || undefined,
            sku: form.variantSku,
            mrp: Number(form.mrp),
            sellingPrice: Number(form.sellingPrice),
            isDefault: true,
          }],
        });
        setOpen(false);
      }
      setForm(EMPTY);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id).catch(() => {});
    load();
  };

  // --- Images ---
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      const imageUrl = res?.data?.url ?? res?.url ?? res?.data?.imageUrl;
      await addProductImage(editingId, { imageUrl, isPrimary: !editingProduct?.images?.length });
      await refreshEditingProduct(editingId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (imageId) => {
    await removeProductImage(editingId, imageId).catch(() => {});
    await refreshEditingProduct(editingId);
  };

  const handleSetPrimary = async (imageId) => {
    await setPrimaryProductImage(editingId, imageId).catch(() => {});
    await refreshEditingProduct(editingId);
  };

  // --- Variants ---
  const handleAddVariant = async () => {
    if (!newVariant.unitId || !newVariant.sku || !newVariant.mrp || !newVariant.sellingPrice) return;
    setAddingVariant(true);
    try {
      await addProductVariant(editingId, {
        unitId: newVariant.unitId,
        name: newVariant.name || undefined,
        sku: newVariant.sku,
        mrp: Number(newVariant.mrp),
        sellingPrice: Number(newVariant.sellingPrice),
      });
      setNewVariant(EMPTY_VARIANT);
      await refreshEditingProduct(editingId);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not add variant');
    } finally {
      setAddingVariant(false);
    }
  };

  const handleUpdateVariantPrice = async (variantId, field, value) => {
    setEditingProduct((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v)),
    }));
  };

  const handleSaveVariant = async (variant) => {
    await updateProductVariant(editingId, variant.id, {
      mrp: Number(variant.mrp),
      sellingPrice: Number(variant.sellingPrice),
    }).catch((err) => setError(err?.response?.data?.message || 'Could not update variant'));
    await refreshEditingProduct(editingId);
    load();
  };

  const handleRemoveVariant = async (variantId) => {
    if (!confirm('Remove this variant?')) return;
    await removeProductVariant(editingId, variantId).catch((err) =>
      setError(err?.response?.data?.message || 'Could not remove variant (a product needs at least one)'),
    );
    await refreshEditingProduct(editingId);
    load();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Product</Button>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f4f7f5' }}>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                No products yet — connect the backend or add your first product.
              </TableCell></TableRow>
            ) : products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.sku}</TableCell>
                <TableCell>₹{p.variants?.[0]?.sellingPrice}</TableCell>
                <TableCell><Chip label={p.status} size="small" /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(p)}><EditOutlinedIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(p.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {!editingId && (
              <TextField label="Product SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            )}
            <TextField label="Description" multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FormControlLabel control={<Switch checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} />} label="Vegetarian" />

            {editingId ? (
              <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
                <MenuItem value="DISCONTINUED">Discontinued</MenuItem>
              </TextField>
            ) : (
              <>
                <Typography sx={{ fontWeight: 700, mt: 1 }}>Default Variant</Typography>
                <TextField select label="Unit" value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })}>
                  {units.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                </TextField>
                <TextField label="Variant Name (e.g. 1 kg Pack)" value={form.variantName} onChange={(e) => setForm({ ...form, variantName: e.target.value })} />
                <TextField label="Variant SKU" value={form.variantSku} onChange={(e) => setForm({ ...form, variantSku: e.target.value })} />
                <Stack direction="row" spacing={2}>
                  <TextField label="MRP" type="number" fullWidth value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />
                  <TextField label="Selling Price" type="number" fullWidth value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
                  <TextField label="Initial Stock" type="number" fullWidth value={form.initialStock} onChange={(e) => setForm({ ...form, initialStock: e.target.value })} />
                </Stack>
              </>
            )}

            {editingId && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography sx={{ fontWeight: 700 }}>Images</Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  {(editingProduct?.images || []).map((img) => (
                    <Box key={img.id} sx={{ position: 'relative' }}>
                      <Avatar src={img.imageUrl} variant="rounded" sx={{ width: 64, height: 64 }} />
                      <IconButton
                        size="small"
                        onClick={() => handleSetPrimary(img.id)}
                        sx={{ position: 'absolute', top: -8, left: -8, bgcolor: 'white', boxShadow: 1, p: 0.3 }}
                      >
                        {img.isPrimary ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(img.id)}
                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1, p: 0.3 }}
                      >
                        <DeleteOutlineIcon fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  ))}
                  <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={uploading} sx={{ height: 64 }}>
                    {uploading ? 'Uploading…' : 'Upload'}
                    <input type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} />
                  </Button>
                </Stack>

                <Divider sx={{ my: 1 }} />
                <Typography sx={{ fontWeight: 700 }}>Variants</Typography>
                {(editingProduct?.variants || []).map((v) => (
                  <Stack key={v.id} direction="row" spacing={1.5} alignItems="center">
                    <TextField label="Name" size="small" value={v.name || ''} disabled sx={{ flex: 1.2 }} />
                    <TextField
                      label="MRP" size="small" type="number" sx={{ flex: 1 }}
                      value={v.mrp} onChange={(e) => handleUpdateVariantPrice(v.id, 'mrp', e.target.value)}
                    />
                    <TextField
                      label="Price" size="small" type="number" sx={{ flex: 1 }}
                      value={v.sellingPrice} onChange={(e) => handleUpdateVariantPrice(v.id, 'sellingPrice', e.target.value)}
                    />
                    <Button size="small" onClick={() => handleSaveVariant(v)}>Save</Button>
                    <IconButton size="small" onClick={() => handleRemoveVariant(v.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                  </Stack>
                ))}

                <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 1 }}>Add New Variant</Typography>
                <Stack direction="row" spacing={1.5}>
                  <TextField select label="Unit" size="small" sx={{ flex: 1 }} value={newVariant.unitId} onChange={(e) => setNewVariant({ ...newVariant, unitId: e.target.value })}>
                    {units.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                  </TextField>
                  <TextField label="Name" size="small" sx={{ flex: 1 }} value={newVariant.name} onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })} />
                  <TextField label="SKU" size="small" sx={{ flex: 1 }} value={newVariant.sku} onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })} />
                </Stack>
                <Stack direction="row" spacing={1.5}>
                  <TextField label="MRP" size="small" type="number" sx={{ flex: 1 }} value={newVariant.mrp} onChange={(e) => setNewVariant({ ...newVariant, mrp: e.target.value })} />
                  <TextField label="Selling Price" size="small" type="number" sx={{ flex: 1 }} value={newVariant.sellingPrice} onChange={(e) => setNewVariant({ ...newVariant, sellingPrice: e.target.value })} />
                  <Button variant="outlined" disabled={addingVariant} onClick={handleAddVariant} sx={{ flex: 1 }}>Add Variant</Button>
                </Stack>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button variant="contained" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Save Product'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

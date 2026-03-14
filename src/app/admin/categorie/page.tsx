'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  FolderTree,
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface Subcategory {
  id: number;
  code: string;
  name: string;
  slug: string;
  categoryId: number;
  sortOrder: number;
}

interface Category {
  id: number;
  code: string;
  name: string;
  slug: string;
  groupId: number;
  sortOrder: number;
  subcategories: Subcategory[];
}

interface Group {
  id: number;
  code: string;
  name: string;
  slug: string;
  sortOrder: number;
  categories: Category[];
}

type ItemType = 'group' | 'category' | 'subcategory';

export default function AdminCategoriePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded state
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Editing state
  const [editingItem, setEditingItem] = useState<{
    type: ItemType;
    id: number;
  } | null>(null);
  const [editName, setEditName] = useState('');

  // Adding state
  const [addingItem, setAddingItem] = useState<{
    type: ItemType;
    parentId?: number;
  } | null>(null);
  const [newName, setNewName] = useState('');

  // Delete confirmation
  const [deletingItem, setDeletingItem] = useState<{
    type: ItemType;
    id: number;
    name: string;
  } | null>(null);

  // Saving state
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Errore nel caricamento');
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleGroup = (id: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    if (!addingItem || !newName.trim()) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        type: addingItem.type,
        data: { name: newName.trim() },
      };
      if (addingItem.type === 'category' && addingItem.parentId) {
        (body.data as Record<string, unknown>).groupId = addingItem.parentId;
      }
      if (addingItem.type === 'subcategory' && addingItem.parentId) {
        (body.data as Record<string, unknown>).categoryId = addingItem.parentId;
      }

      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Errore nella creazione');
      }

      // Expand parent after adding
      if (addingItem.type === 'category' && addingItem.parentId) {
        setExpandedGroups((prev) => new Set(prev).add(addingItem.parentId!));
      }
      if (addingItem.type === 'subcategory' && addingItem.parentId) {
        setExpandedCategories((prev) => new Set(prev).add(addingItem.parentId!));
      }

      setAddingItem(null);
      setNewName('');
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingItem || !editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editingItem.type,
          id: editingItem.id,
          data: { name: editName.trim() },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Errore nell\'aggiornamento');
      }

      setEditingItem(null);
      setEditName('');
      await fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Errore nell\'aggiornamento'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: deletingItem.type,
          id: deletingItem.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Errore nell\'eliminazione');
      }

      setDeletingItem(null);
      await fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Errore nell\'eliminazione'
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (type: ItemType, id: number, name: string) => {
    setEditingItem({ type, id });
    setEditName(name);
    setAddingItem(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditName('');
  };

  const startAdd = (type: ItemType, parentId?: number) => {
    setAddingItem({ type, parentId });
    setNewName('');
    setEditingItem(null);
  };

  const cancelAdd = () => {
    setAddingItem(null);
    setNewName('');
  };

  const isEditing = (type: ItemType, id: number) =>
    editingItem?.type === type && editingItem?.id === id;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">
          Gestione Categorie
        </h1>
        <button
          onClick={() => startAdd('group')}
          className="flex items-center gap-2 bg-navy text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors"
        >
          <Plus size={16} />
          Nuovo Gruppo
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red/10 text-red border border-red/20 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto hover:opacity-70"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Adding a new group */}
      {addingItem?.type === 'group' && !addingItem.parentId && (
        <div className="mb-4 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') cancelAdd();
              }}
              placeholder="Nome del nuovo gruppo..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
              autoFocus
              disabled={saving}
            />
            <button
              onClick={handleAdd}
              disabled={saving || !newName.trim()}
              className="flex items-center gap-1 bg-blue text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Salva
            </button>
            <button
              onClick={cancelAdd}
              disabled={saving}
              className="flex items-center gap-1 border px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <X size={14} />
              Annulla
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <Loader2 size={24} className="mx-auto mb-2 animate-spin" />
            Caricamento...
          </div>
        ) : groups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FolderTree size={48} className="mx-auto mb-4 text-gray-300" />
            Nessun gruppo trovato. Crea il primo gruppo per iniziare.
          </div>
        ) : (
          <div className="divide-y">
            {groups.map((group) => (
              <div key={group.id}>
                {/* Group row */}
                <div className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 group">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="p-0.5 hover:bg-gray-200 rounded"
                  >
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown size={18} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={18} className="text-gray-500" />
                    )}
                  </button>

                  {isEditing('group', group.id) ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                        autoFocus
                        disabled={saving}
                      />
                      <button
                        onClick={handleEdit}
                        disabled={saving || !editName.trim()}
                        className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-sm flex-1">
                        {group.name}
                      </span>
                      <span className="text-xs text-gray-400 font-mono mr-2">
                        {group.slug}
                      </span>
                      <span className="text-xs text-gray-400 mr-4">
                        {group.categories.length} categorie
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startAdd('category', group.id)}
                          className="p-1.5 text-blue hover:bg-blue/10 rounded"
                          title="Aggiungi categoria"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() =>
                            startEdit('group', group.id, group.name)
                          }
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                          title="Modifica"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() =>
                            setDeletingItem({
                              type: 'group',
                              id: group.id,
                              name: group.name,
                            })
                          }
                          className="p-1.5 text-red hover:bg-red/10 rounded"
                          title="Elimina"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Categories */}
                {expandedGroups.has(group.id) && (
                  <div className="bg-gray-50/50">
                    {/* Adding category under this group */}
                    {addingItem?.type === 'category' &&
                      addingItem.parentId === group.id && (
                        <div className="flex items-center gap-2 pl-12 pr-4 py-2">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAdd();
                              if (e.key === 'Escape') cancelAdd();
                            }}
                            placeholder="Nome della nuova categoria..."
                            className="flex-1 border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                            autoFocus
                            disabled={saving}
                          />
                          <button
                            onClick={handleAdd}
                            disabled={saving || !newName.trim()}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                          >
                            {saving ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                          </button>
                          <button
                            onClick={cancelAdd}
                            disabled={saving}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}

                    {group.categories.map((cat) => (
                      <div key={cat.id}>
                        {/* Category row */}
                        <div className="flex items-center gap-2 pl-10 pr-4 py-2.5 hover:bg-gray-100/50 group/cat">
                          <button
                            onClick={() => toggleCategory(cat.id)}
                            className="p-0.5 hover:bg-gray-200 rounded"
                          >
                            {expandedCategories.has(cat.id) ? (
                              <ChevronDown
                                size={16}
                                className="text-gray-400"
                              />
                            ) : (
                              <ChevronRight
                                size={16}
                                className="text-gray-400"
                              />
                            )}
                          </button>

                          {isEditing('category', cat.id) ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                                autoFocus
                                disabled={saving}
                              />
                              <button
                                onClick={handleEdit}
                                disabled={saving || !editName.trim()}
                                className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                              >
                                {saving ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Check size={14} />
                                )}
                              </button>
                              <button
                                onClick={cancelEdit}
                                disabled={saving}
                                className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm flex-1">{cat.name}</span>
                              <span className="text-xs text-gray-400 font-mono mr-2">
                                {cat.slug}
                              </span>
                              <span className="text-xs text-gray-400 mr-4">
                                {cat.subcategories.length} sottocategorie
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    startAdd('subcategory', cat.id)
                                  }
                                  className="p-1.5 text-blue hover:bg-blue/10 rounded"
                                  title="Aggiungi sottocategoria"
                                >
                                  <Plus size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    startEdit('category', cat.id, cat.name)
                                  }
                                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                  title="Modifica"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeletingItem({
                                      type: 'category',
                                      id: cat.id,
                                      name: cat.name,
                                    })
                                  }
                                  className="p-1.5 text-red hover:bg-red/10 rounded"
                                  title="Elimina"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Subcategories */}
                        {expandedCategories.has(cat.id) && (
                          <div>
                            {/* Adding subcategory under this category */}
                            {addingItem?.type === 'subcategory' &&
                              addingItem.parentId === cat.id && (
                                <div className="flex items-center gap-2 pl-20 pr-4 py-2">
                                  <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleAdd();
                                      if (e.key === 'Escape') cancelAdd();
                                    }}
                                    placeholder="Nome della nuova sottocategoria..."
                                    className="flex-1 border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                                    autoFocus
                                    disabled={saving}
                                  />
                                  <button
                                    onClick={handleAdd}
                                    disabled={saving || !newName.trim()}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                  >
                                    {saving ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Check size={14} />
                                    )}
                                  </button>
                                  <button
                                    onClick={cancelAdd}
                                    disabled={saving}
                                    className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              )}

                            {cat.subcategories.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center gap-2 pl-20 pr-4 py-2 hover:bg-gray-100/30 group/sub"
                              >
                                <div className="w-2 h-2 rounded-full bg-gray-300" />

                                {isEditing('subcategory', sub.id) ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) =>
                                        setEditName(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleEdit();
                                        if (e.key === 'Escape') cancelEdit();
                                      }}
                                      className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                                      autoFocus
                                      disabled={saving}
                                    />
                                    <button
                                      onClick={handleEdit}
                                      disabled={saving || !editName.trim()}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                    >
                                      {saving ? (
                                        <Loader2
                                          size={14}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Check size={14} />
                                      )}
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      disabled={saving}
                                      className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-sm text-gray-700 flex-1">
                                      {sub.name}
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono mr-2">
                                      {sub.slug}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                      <button
                                        onClick={() =>
                                          startEdit(
                                            'subcategory',
                                            sub.id,
                                            sub.name
                                          )
                                        }
                                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                        title="Modifica"
                                      >
                                        <Pencil size={14} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setDeletingItem({
                                            type: 'subcategory',
                                            id: sub.id,
                                            name: sub.name,
                                          })
                                        }
                                        className="p-1.5 text-red hover:bg-red/10 rounded"
                                        title="Elimina"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}

                            {cat.subcategories.length === 0 &&
                              !(
                                addingItem?.type === 'subcategory' &&
                                addingItem.parentId === cat.id
                              ) && (
                                <div className="pl-20 pr-4 py-2 text-xs text-gray-400 italic">
                                  Nessuna sottocategoria
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    ))}

                    {group.categories.length === 0 &&
                      !(
                        addingItem?.type === 'category' &&
                        addingItem.parentId === group.id
                      ) && (
                        <div className="pl-12 pr-4 py-2 text-xs text-gray-400 italic">
                          Nessuna categoria in questo gruppo
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-heading font-bold text-lg mb-2">
              Conferma eliminazione
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sei sicuro di voler eliminare{' '}
              <strong>{deletingItem.name}</strong>? Questa azione non
              può essere annullata.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingItem(null)}
                disabled={saving}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1 bg-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red/90 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

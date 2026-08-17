import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle, Smartphone, Globe, Shield, Send, Plus, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { AppUpdate } from '../types';

export const AppUpdateCenter: React.FC = () => {
  const { currentUser, isAppUpdateCenterOpen, setIsAppUpdateCenterOpen, markUpdatesAsRead, showToast } = useApp();
  const [updates, setUpdates] = useState<AppUpdate[]>([]);
  const [showPublisher, setShowPublisher] = useState(false);

  // New Version Release Form
  const [version, setVersion] = useState('3.1.0');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'feature' | 'improvement' | 'fix' | 'security' | 'announcement'>('feature');
  const [importance, setImportance] = useState<'normal' | 'important' | 'critical'>('normal');
  const [changelogRaw, setChangelogRaw] = useState('');
  const [publishing, setPublishing] = useState(false);

  const isOwnerOrManager = ['owner', 'manager', 'super_admin', 'admin'].includes(currentUser.role);

  useEffect(() => {
    if (isAppUpdateCenterOpen) {
      loadUpdates();
      markUpdatesAsRead();
    }
  }, [isAppUpdateCenterOpen]);

  const loadUpdates = async () => {
    try {
      const res = await api.getAppUpdates();
      if (res.success && res.data) {
        setUpdates(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAppUpdateCenterOpen) return null;

  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !version.trim()) return;

    setPublishing(true);
    try {
      const changelogList = changelogRaw
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const res = await api.publishAppUpdate({
        version,
        title,
        description,
        category,
        importance,
        platform: 'all',
        changelog: changelogList,
        publishedBy: currentUser.name,
      });

      if (res.success && res.data) {
        showToast(`App Update v${version} published successfully!`);
        setShowPublisher(false);
        setTitle('');
        setDescription('');
        setChangelogRaw('');
        loadUpdates();
      }
    } catch (err) {
      showToast('Failed to publish app update');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">DealHub App Update Center</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  What's New
                </span>
              </div>
              <p className="text-xs text-slate-400">Platform Releases, Version History & Feature Notes</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isOwnerOrManager && !showPublisher && (
              <button
                onClick={() => setShowPublisher(true)}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 text-xs transition flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Publish New Version
              </button>
            )}
            <button
              onClick={() => setIsAppUpdateCenterOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Publisher Form / Update Feed */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {showPublisher ? (
            <form onSubmit={handlePublishUpdate} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Publish Platform Version Update
                </h4>
                <button
                  type="button"
                  onClick={() => setShowPublisher(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Version Number</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g., 3.1.0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="feature">Major Feature</option>
                    <option value="improvement">Performance Improvement</option>
                    <option value="fix">Bug Fix</option>
                    <option value="security">Security Update</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Importance</label>
                  <select
                    value={importance}
                    onChange={(e) => setImportance(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="normal">Normal Update</option>
                    <option value="important">Important Release</option>
                    <option value="critical">Critical Required Update</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Release Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Phase 3 Milestone: Zero-Budget AI & Manager Control"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Overview Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Summary of what users get in this update..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Changelog Bullet Points (One per line)</label>
                <textarea
                  value={changelogRaw}
                  onChange={(e) => setChangelogRaw(e.target.value)}
                  rows={4}
                  placeholder="• Added Zero-Budget AI Customer Support
• Implemented 5-tier mobile role hierarchy
• Added Owner Premium Dashboard"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
              >
                {publishing ? 'Publishing Version...' : 'Publish Update to Users'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {updates.map((upd) => (
                <div key={upd.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg">
                        v{upd.version}
                      </span>
                      <span className="text-xs font-bold text-white">{upd.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{upd.releaseDate}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{upd.description}</p>

                  {Array.isArray(upd.changelog) && upd.changelog.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <p className="text-[11px] font-bold text-slate-400 mb-1.5">What's New in this Version:</p>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {upd.changelog.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Published by: {upd.publishedBy || 'DealHub Team'}</span>
                    <span className="uppercase">{upd.platform} Platform</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

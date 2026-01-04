import React, { useState, useRef } from 'react';
import { User, Task, TaskStatus, Reward, TimeSlot } from '../types';
import { Button, Card, Input, StatusBadge } from './Common';
import { Camera, CheckCircle, X, Clock, ImageIcon, Trash2, PlusCircle, Home, ShoppingBag, Edit3, User as UserIcon, Calendar, Sun, Sunrise, Sunset, Moon, Aperture, Heart, MessageCircle, Video } from './Icons';
import { TASK_PRESETS, TIME_SLOT_CONFIG } from '../constants';

interface ParentViewProps {
  currentUser: User;
  childrenUsers: User[];
  tasks: Task[];
  rewards: Reward[];
  onAddTask: (task: Omit<Task, 'id' | 'status' | 'createdBy'>) => void;
  onAddTasks: (tasks: Omit<Task, 'id' | 'status' | 'createdBy'>[]) => void;
  onVerifyTask: (taskId: string, approved: boolean, feedback: string, proofImage?: string, points?: number) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteMemory: (taskId: string) => void;
  onAddReward: (reward: Omit<Reward, 'id'>) => void;
  onDeleteReward: (rewardId: string) => void;
}

export const ParentView: React.FC<ParentViewProps> = ({ 
  currentUser, 
  childrenUsers, 
  tasks, 
  rewards,
  onAddTask, 
  onAddTasks,
  onVerifyTask,
  onDeleteTask,
  onDeleteMemory,
  onAddReward,
  onDeleteReward
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'publish' | 'store' | 'moments'>('home');
  const [selectedTaskToVerify, setSelectedTaskToVerify] = useState<Task | null>(null);

  // Publish Forms
  const [publishMode, setPublishMode] = useState<'single' | 'daily'>('single');
  
  // Single Task Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState(10);
  const [newTaskAssignee, setNewTaskAssignee] = useState(childrenUsers[0]?.id || '');
  const [newTaskIcon, setNewTaskIcon] = useState('📝');
  
  // Daily Plan Form
  const [selectedPresets, setSelectedPresets] = useState<{slot: TimeSlot, preset: typeof TASK_PRESETS[0]}[]>([]);

  // Reward Form
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardCost, setNewRewardCost] = useState(50);
  const [newRewardIcon, setNewRewardIcon] = useState('🎁');

  // Verify State
  const [feedback, setFeedback] = useState('');
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handlePresetClick = (preset: typeof TASK_PRESETS[0]) => {
    setNewTaskTitle(preset.title);
    setNewTaskDesc(preset.desc);
    setNewTaskIcon(preset.icon);
  };

  const toggleDailyPreset = (slot: TimeSlot, preset: typeof TASK_PRESETS[0]) => {
     const exists = selectedPresets.find(p => p.slot === slot && p.preset.title === preset.title);
     if (exists) {
       setSelectedPresets(selectedPresets.filter(p => p !== exists));
     } else {
       setSelectedPresets([...selectedPresets, { slot, preset }]);
     }
  };

  const submitNewTask = () => {
    if (!newTaskTitle || !newTaskAssignee) return;
    onAddTask({
      title: newTaskTitle,
      description: newTaskDesc,
      assignedToId: newTaskAssignee,
      pointsReward: newTaskPoints,
      categoryIcon: newTaskIcon
    });
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPoints(10);
    setNewTaskIcon('📝');
    setActiveTab('home');
  };

  const submitDailyPlan = () => {
     if (selectedPresets.length === 0 || !newTaskAssignee) return;
     
     const tasksToPublish = selectedPresets.map(({slot, preset}) => ({
         title: preset.title,
         description: preset.desc,
         assignedToId: newTaskAssignee,
         pointsReward: 10, // Default points for batch
         categoryIcon: preset.icon,
         timeSlot: slot
     }));

     onAddTasks(tasksToPublish);

     setSelectedPresets([]);
     setActiveTab('home');
  };

  const submitNewReward = () => {
    if(!newRewardTitle) return;
    onAddReward({
      title: newRewardTitle,
      cost: newRewardCost,
      icon: newRewardIcon
    });
    setNewRewardTitle('');
    setNewRewardCost(50);
    setNewRewardIcon('🎁');
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitVerification = (approved: boolean) => {
    if (!selectedTaskToVerify) return;
    onVerifyTask(
      selectedTaskToVerify.id, 
      approved, 
      feedback, 
      approved ? (proofImage || undefined) : undefined, 
      approved ? pointsAwarded : 0
    );
    setSelectedTaskToVerify(null);
    setFeedback('');
    setProofImage(null);
  };

  const pendingTasks = tasks.filter(t => t.status === TaskStatus.WAITING_VERIFICATION);
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).sort((a,b) => 
    new Date(b.verifiedAt || b.completedAt || 0).getTime() - new Date(a.verifiedAt || a.completedAt || 0).getTime()
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-800 font-sans">
      
      {/* Top Bar */}
      <div className="bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-20 shrink-0">
        <div>
           <h1 className="text-xl font-extrabold tracking-tight text-gray-900">家庭管家</h1>
           <p className="text-xs text-gray-400">今天是 {new Date().toLocaleDateString()}</p>
        </div>
        <img src={currentUser.avatar} className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50" />
      </div>

      {/* Main Content Area - Added min-h-0 to ensure flex child scrolls properly */}
      <div className="flex-1 overflow-y-auto p-5 pb-32 min-h-0">
        
        {/* === HOME TAB === */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase">待办任务</p>
                <p className="text-2xl font-black text-gray-800">{tasks.filter(t => t.status === TaskStatus.PENDING).length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                 <p className="text-xs text-gray-400 font-bold uppercase">待核验</p>
                 <p className={`text-2xl font-black ${pendingTasks.length > 0 ? 'text-blue-500' : 'text-gray-800'}`}>{pendingTasks.length}</p>
              </div>
            </div>

            {/* Pending Verifications */}
            {pendingTasks.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 mb-3 ml-1">需要您检查</h2>
                <div className="space-y-3">
                  {pendingTasks.map(task => {
                    const child = childrenUsers.find(c => c.id === task.assignedToId);
                    return (
                      <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-500 flex flex-col gap-3">
                         <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <span className="text-xl">{task.categoryIcon || '📝'}</span>
                              <div>
                                <span className="font-bold text-gray-800 block">{task.title}</span>
                                <span className="text-xs text-gray-400">{child?.name}</span>
                              </div>
                           </div>
                           <Button size="sm" onClick={() => { setSelectedTaskToVerify(task); setPointsAwarded(task.pointsReward); }}>
                             去核验
                           </Button>
                         </div>
                         {/* Child's feedback preview */}
                         {(task.childFeedback || task.childProofImage) && (
                           <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2 text-xs text-gray-500">
                              <span className="font-bold">孩子提交了反馈</span>
                              {task.childProofMediaType === 'video' ? <Video size={12}/> : (task.childProofImage && <ImageIcon size={12}/>)}
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Tasks */}
            <div>
               <h2 className="text-sm font-bold text-gray-500 mb-3 ml-1">任务列表</h2>
               <div className="space-y-3">
                 {tasks.filter(t => t.status !== TaskStatus.WAITING_VERIFICATION).length === 0 && (
                   <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                     <p>暂无任务，去发布一个吧</p>
                   </div>
                 )}
                 {tasks.filter(t => t.status !== TaskStatus.WAITING_VERIFICATION).sort((a,b) => b.id.localeCompare(a.id)).map(task => (
                   <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl">
                           {task.categoryIcon || '📝'}
                         </div>
                         <div>
                            <p className="font-bold text-gray-800 text-sm">{task.title}</p>
                            <StatusBadge status={task.status} />
                         </div>
                      </div>
                      <button onClick={() => onDeleteTask(task.id)} className="text-gray-300 hover:text-red-400">
                        <Trash2 size={18} />
                      </button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* === PUBLISH TAB === */}
        {activeTab === 'publish' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-xl font-bold text-gray-900">发布新挑战</h2>
            
            {/* Child Selector */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {childrenUsers.map(child => (
                <button
                  key={child.id}
                  onClick={() => setNewTaskAssignee(child.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${newTaskAssignee === child.id ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  <img src={child.avatar} className="w-5 h-5 rounded-full bg-gray-100" />
                  <span className="text-sm font-bold">{child.name}</span>
                </button>
              ))}
            </div>

            {/* Toggle Mode */}
            <div className="bg-gray-100 p-1 rounded-xl flex">
               <button 
                 onClick={() => setPublishMode('single')}
                 className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${publishMode === 'single' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
               >
                 单个任务
               </button>
               <button 
                 onClick={() => setPublishMode('daily')}
                 className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${publishMode === 'daily' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
               >
                 今日任务 (计划)
               </button>
            </div>

            {/* === SINGLE TASK MODE === */}
            {publishMode === 'single' && (
              <div className="space-y-6 animate-in fade-in">
                 {/* Presets Grid */}
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">快速预设</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TASK_PRESETS.map((preset, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handlePresetClick(preset)}
                        className="flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-blue-400 hover:bg-blue-50 transition-colors active:scale-95"
                      >
                        <span className="text-2xl mb-1">{preset.icon}</span>
                        <span className="text-[10px] font-bold text-gray-600 truncate w-full text-center">{preset.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                  <div className="flex gap-2">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl text-2xl border border-gray-200 shrink-0">
                      {newTaskIcon}
                    </div>
                    <Input 
                      placeholder="任务名称" 
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="text-lg font-bold"
                    />
                  </div>
                  
                  <textarea 
                      className="w-full bg-gray-50 border-0 rounded-xl p-3 text-sm text-gray-600 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                      rows={3}
                      placeholder="任务详情描述..."
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                  />

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                      <span className="text-sm font-bold text-gray-500">奖励积分</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setNewTaskPoints(Math.max(5, newTaskPoints - 5))} className="w-8 h-8 rounded-full bg-white shadow-sm font-bold text-gray-500">-</button>
                        <span className="font-black text-xl w-8 text-center">{newTaskPoints}</span>
                        <button onClick={() => setNewTaskPoints(Math.min(100, newTaskPoints + 5))} className="w-8 h-8 rounded-full bg-white shadow-sm font-bold text-gray-500">+</button>
                      </div>
                  </div>

                  <Button className="w-full py-4 shadow-lg shadow-blue-200" onClick={submitNewTask}>
                    立即发布
                  </Button>
                </div>
              </div>
            )}

            {/* === DAILY PLAN MODE === */}
            {publishMode === 'daily' && (
               <div className="space-y-6 animate-in fade-in pb-12">
                  <div className="flex items-center justify-between">
                     <p className="text-sm text-gray-500">为孩子规划一整天的任务</p>
                     <p className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                        📅 {new Date().toLocaleDateString()}
                     </p>
                  </div>
                  
                  {(Object.keys(TIME_SLOT_CONFIG) as TimeSlot[]).map((slot) => {
                     const config = TIME_SLOT_CONFIG[slot];
                     return (
                       <div key={slot}>
                          <div className={`flex items-center gap-2 mb-3 px-2 py-1 rounded-lg w-fit ${config.color}`}>
                             <span>{config.icon}</span>
                             <span className="text-xs font-bold">{config.label}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                             {config.presets.map((preset, idx) => {
                               const isSelected = selectedPresets.some(p => p.slot === slot && p.preset.title === preset.title);
                               return (
                                 <button 
                                   key={idx}
                                   onClick={() => toggleDailyPreset(slot, preset)}
                                   className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isSelected ? 'bg-blue-50 border-blue-500 shadow-md transform scale-[1.02]' : 'bg-white border-gray-100 text-gray-600'}`}
                                 >
                                    <span className="text-2xl">{preset.icon}</span>
                                    <div>
                                       <span className={`font-bold text-sm block ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{preset.title}</span>
                                       <span className={`text-[10px] ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>10 积分</span>
                                    </div>
                                    {isSelected && <CheckCircle className="ml-auto w-4 h-4 text-blue-500 fill-blue-100" />}
                                 </button>
                               );
                             })}
                          </div>
                       </div>
                     )
                  })}

                  {/* Fixed Button Layout - No sticky/gap issues */}
                  <div className="mt-8 bg-white p-4 rounded-2xl shadow-md border border-gray-200">
                     <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-500">已选 {selectedPresets.length} 个任务</span>
                        <span className="font-black text-xl text-blue-500">{selectedPresets.length * 10} 积分</span>
                     </div>
                     <Button className="w-full py-3" onClick={submitDailyPlan} disabled={selectedPresets.length === 0}>
                        一键发布今日计划 ({new Date().toLocaleDateString()})
                     </Button>
                  </div>
               </div>
            )}

          </div>
        )}

        {/* === MOMENTS CIRCLE (NEW) === */}
        {activeTab === 'moments' && (
           <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="relative">
                 {/* Banner */}
                 <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 rounded-b-3xl -mx-5 -mt-5 mb-10 shadow-sm"></div>
                 
                 {/* Profile Area */}
                 <div className="absolute top-28 left-4 flex items-end gap-3 px-2">
                    <img src={currentUser.avatar} className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md z-10" />
                    <div className="mb-1 pt-12">
                       <h2 className="text-xl font-black text-gray-900 leading-tight">{currentUser.name}的家庭圈</h2>
                       <p className="text-xs text-gray-500 font-bold mt-1">记录宝贝成长的每一个瞬间</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 pt-4">
                 {completedTasks.length === 0 && (
                   <div className="text-center py-10 text-gray-400">
                     <Aperture className="mx-auto mb-2 opacity-50" size={32}/>
                     <p>还没有动态哦，快去发布任务吧！</p>
                   </div>
                 )}

                 {completedTasks.map(task => {
                   const child = childrenUsers.find(c => c.id === task.assignedToId);
                   return (
                     <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-3">
                           <img src={child?.avatar} className="w-10 h-10 rounded-full bg-gray-50" />
                           <div>
                              <p className="font-bold text-gray-900 text-sm">{child?.name}</p>
                              <p className="text-xs text-gray-400">完成任务: <span className="text-gray-600 font-bold">{task.title}</span></p>
                           </div>
                           <span className="ml-auto text-xs text-gray-300">{new Date(task.verifiedAt || task.completedAt || 0).toLocaleDateString()}</span>
                        </div>

                        {/* Content */}
                        <div className="pl-[3.25rem]">
                           {task.childFeedback && (
                             <p className="text-sm text-gray-800 mb-2">"{task.childFeedback}"</p>
                           )}
                           
                           {/* Media Grid */}
                           {(task.childProofImage || task.proofImage) && (
                              <div className="rounded-xl overflow-hidden mb-3 border border-gray-100 bg-gray-50 max-h-64">
                                {(task.proofMediaType === 'video' || (!task.proofMediaType && task.childProofMediaType === 'video')) ? (
                                   <video 
                                     src={task.proofImage || task.childProofImage} 
                                     controls 
                                     className="w-full h-full object-cover"
                                   />
                                ) : (
                                   <img 
                                     src={task.proofImage || task.childProofImage} 
                                     className="w-full h-full object-cover" 
                                   />
                                )}
                              </div>
                           )}

                           {/* Interaction Area */}
                           <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                 <Heart size={14} className="text-red-400 fill-red-400" />
                                 <span className="font-bold text-gray-700">获得 {task.pointsReward} 积分</span>
                              </div>
                              {task.feedback && (
                                <div className="flex items-start gap-2 text-xs text-gray-500 border-t border-gray-200 pt-2 mt-1">
                                   <MessageCircle size={14} className="mt-0.5" />
                                   <span><span className="font-bold text-blue-600">家长评语:</span> {task.feedback}</span>
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>
        )}

        {/* === STORE MANAGEMENT TAB === */}
        {activeTab === 'store' && (
           <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h2 className="text-xl font-bold text-gray-900">积分兑换管理</h2>
              <p className="text-sm text-gray-500 -mt-4">设置孩子可以用积分兑换的奖励。</p>

              {/* Add New Reward */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-2 items-center">
                 <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg text-xl cursor-pointer" onClick={() => {
                   const icons = ['🎁','🍦','📺','🎮','🎫','🍟','🎨'];
                   setNewRewardIcon(icons[Math.floor(Math.random()*icons.length)]);
                 }}>
                   {newRewardIcon}
                 </div>
                 <div className="flex-1 space-y-2">
                   <input 
                     className="w-full bg-transparent border-b border-gray-200 text-sm font-bold focus:outline-none focus:border-blue-500 px-1 py-1"
                     placeholder="奖励名称 (如:看电视)"
                     value={newRewardTitle}
                     onChange={e => setNewRewardTitle(e.target.value)}
                   />
                   <div className="flex items-center gap-2">
                     <span className="text-xs text-gray-400">消耗积分:</span>
                     <input 
                       type="number"
                       className="w-16 bg-gray-50 rounded px-2 py-0.5 text-xs font-bold text-center"
                       value={newRewardCost}
                       onChange={e => setNewRewardCost(parseInt(e.target.value) || 0)}
                     />
                   </div>
                 </div>
                 <button onClick={submitNewReward} disabled={!newRewardTitle} className="bg-black text-white p-2 rounded-xl disabled:opacity-50">
                    <PlusCircle size={20} />
                 </button>
              </div>

              {/* Reward List */}
              <div className="space-y-3">
                 {rewards.map(reward => (
                   <div key={reward.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                         <span className="text-2xl">{reward.icon}</span>
                         <div>
                            <p className="font-bold text-gray-800 text-sm">{reward.title}</p>
                            <p className="text-xs text-orange-500 font-bold">{reward.cost} 积分</p>
                         </div>
                      </div>
                      <button onClick={() => onDeleteReward(reward.id)} className="text-gray-300 hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                   </div>
                 ))}
               </div>
           </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex justify-between items-end z-30 pb-6 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] shrink-0">
         <button 
           onClick={() => setActiveTab('home')}
           className={`flex-1 flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-black' : 'text-gray-300'}`}
         >
            <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">首页</span>
         </button>
         
         <button 
           onClick={() => setActiveTab('moments')}
           className={`flex-1 flex flex-col items-center gap-1 transition-colors ${activeTab === 'moments' ? 'text-black' : 'text-gray-300'}`}
         >
            <Aperture size={24} strokeWidth={activeTab === 'moments' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">时光圈</span>
         </button>

         <button 
           onClick={() => setActiveTab('publish')}
           className="bg-black text-white rounded-full w-14 h-14 flex items-center justify-center -mb-4 shadow-lg shadow-gray-300 active:scale-95 transition-transform mx-2"
         >
            <PlusCircle size={28} />
         </button>

         <button 
           onClick={() => setActiveTab('store')}
           className={`flex-1 flex flex-col items-center gap-1 transition-colors ${activeTab === 'store' ? 'text-black' : 'text-gray-300'}`}
         >
            <ShoppingBag size={24} strokeWidth={activeTab === 'store' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">兑换</span>
         </button>
         
         {/* Placeholder for symmetry or add Settings later */}
         <div className="flex-1"></div>
      </div>

       {/* VERIFY MODAL */}
       {selectedTaskToVerify && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                 {selectedTaskToVerify.categoryIcon || '📝'}
               </div>
               <h3 className="text-lg font-extrabold text-gray-900">{selectedTaskToVerify.title}</h3>
               <p className="text-xs text-gray-500 mt-1">请检查孩子的完成情况</p>
            </div>

            {/* Child Submission Info */}
            {(selectedTaskToVerify.childProofImage || selectedTaskToVerify.childFeedback) && (
              <div className="bg-blue-50 p-4 rounded-2xl mb-4 text-sm">
                 <p className="text-xs font-bold text-blue-400 mb-2 uppercase">孩子提交的内容:</p>
                 {selectedTaskToVerify.childProofImage && (
                    <div className="rounded-xl overflow-hidden mb-2 bg-white max-h-40">
                      {selectedTaskToVerify.childProofMediaType === 'video' ? (
                        <video src={selectedTaskToVerify.childProofImage} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={selectedTaskToVerify.childProofImage} className="w-full h-full object-cover" />
                      )}
                    </div>
                 )}
                 {selectedTaskToVerify.childFeedback && (
                   <p className="bg-white p-2 rounded-lg text-blue-900 italic">"{selectedTaskToVerify.childFeedback}"</p>
                 )}
              </div>
            )}
            
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-blue-300 transition-colors"
               >
                   {proofImage ? (
                     <img src={proofImage} className="w-full h-full object-cover" />
                   ) : (
                     <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-400">
                       <Camera size={24} />
                       <span className="text-xs mt-2 font-bold">拍摄/上传存档照片 (可选)</span>
                     </div>
                   )}
                   <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
              </div>

              <Input 
                placeholder="给孩子写句鼓励的话..." 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-gray-50 border-0 focus:ring-1 focus:ring-blue-200"
              />

              <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                 <span className="text-xs font-bold text-yellow-700">发放积分</span>
                 <div className="flex items-center gap-3">
                   <button onClick={() => setPointsAwarded(Math.max(1, pointsAwarded - 1))} className="w-6 h-6 rounded bg-white text-yellow-600 font-bold">-</button>
                   <span className="font-black text-lg text-yellow-600 w-6 text-center">{pointsAwarded}</span>
                   <button onClick={() => setPointsAwarded(Math.min(50, pointsAwarded + 1))} className="w-6 h-6 rounded bg-white text-yellow-600 font-bold">+</button>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={() => setSelectedTaskToVerify(null)} className="py-3 rounded-xl font-bold text-gray-500 bg-gray-100">
                   取消
                </button>
                <button onClick={() => submitVerification(false)} className="py-3 rounded-xl font-bold text-white bg-red-500">
                   驳回
                </button>
                <button onClick={() => submitVerification(true)} className="col-span-2 py-3 rounded-xl font-bold text-white bg-black shadow-lg">
                   通过并存档
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
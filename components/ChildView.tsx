import React, { useState, useRef } from 'react';
import { User, Task, TaskStatus, Reward, TimeSlot } from '../types';
import { Button, Card, Input } from './Common';
import { Trophy, Star, Clock, ImageIcon, Gift, ScrollText, Crown, Medal, CheckCircle, User as UserIcon, Store, ShoppingBag, Camera, X, MessageCircle, Video, ChevronLeft, Sun } from './Icons';
import { TIME_SLOT_CONFIG } from '../constants';

interface ChildViewProps {
  currentUser: User;
  allChildren: User[]; 
  tasks: Task[];
  rewards: Reward[];
  onCompleteTask: (taskId: string, proofImage?: string, mediaType?: 'image' | 'video', feedback?: string) => void;
  onRedeemReward: (reward: Reward) => void;
}

// Level configurations
const LEVELS = [
  { name: '萌新冒险家', min: 0, color: 'text-gray-600', bg: 'bg-gray-200' },
  { name: '闪亮探索者', min: 50, color: 'text-blue-500', bg: 'bg-blue-100' },
  { name: '皇家守卫', min: 150, color: 'text-purple-500', bg: 'bg-purple-100' },
  { name: '超级小英雄', min: 300, color: 'text-red-500', bg: 'bg-red-100' },
  { name: '传奇队长', min: 600, color: 'text-yellow-600', bg: 'bg-yellow-100' },
];

export const ChildView: React.FC<ChildViewProps> = ({ currentUser, allChildren, tasks, rewards, onCompleteTask, onRedeemReward }) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'history' | 'rank' | 'store'>('missions');
  const [celebration, setCelebration] = useState<boolean>(false);
  
  // UI State for Daily Tasks Drill-down
  const [showDailyDetail, setShowDailyDetail] = useState(false);

  // Submission Modal State
  const [submissionTask, setSubmissionTask] = useState<Task | null>(null);
  const [submissionFeedback, setSubmissionFeedback] = useState('');
  const [submissionMedia, setSubmissionMedia] = useState<string | null>(null);
  const [submissionMediaType, setSubmissionMediaType] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Tasks
  const myTasks = tasks.filter(t => t.assignedToId === currentUser.id);
  const completedTasks = myTasks.filter(t => t.status === TaskStatus.COMPLETED).sort((a,b) => 
    new Date(b.verifiedAt || b.completedAt || 0).getTime() - new Date(a.verifiedAt || a.completedAt || 0).getTime()
  );

  // Split Pending Tasks
  const pendingTasks = myTasks.filter(t => t.status === TaskStatus.PENDING);
  const waitingTasks = myTasks.filter(t => t.status === TaskStatus.WAITING_VERIFICATION);

  // Daily Tasks (have a timeSlot) vs Single Tasks (no timeSlot)
  const dailyTasksAll = myTasks.filter(t => !!t.timeSlot); // All daily tasks (pending + completed + waiting)
  const dailyTasksPending = dailyTasksAll.filter(t => t.status === TaskStatus.PENDING);
  
  // Single Tasks (Pending)
  const singleTasksPending = pendingTasks.filter(t => !t.timeSlot);

  // Calculate Daily Progress
  const dailyTotal = dailyTasksAll.length;
  const dailyCompleted = dailyTasksAll.filter(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.WAITING_VERIFICATION).length;
  const dailyProgress = dailyTotal > 0 ? Math.round((dailyCompleted / dailyTotal) * 100) : 0;

  // Group Pending Tasks by TimeSlot
  const groupedPendingTasks: Record<string, Task[]> = {
    'MORNING': [], 'NOON': [], 'AFTERNOON': [], 'EVENING': []
  };
  dailyTasksPending.forEach(task => {
    if (task.timeSlot && groupedPendingTasks[task.timeSlot]) {
      groupedPendingTasks[task.timeSlot].push(task);
    }
  });

  // Level Logic
  const currentPoints = currentUser.points || 0;
  const currentLevelIndex = LEVELS.findIndex((l, i) => 
    currentPoints >= l.min && (LEVELS[i+1] ? currentPoints < LEVELS[i+1].min : true)
  );
  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = LEVELS[currentLevelIndex + 1];
  
  // Progress Bar
  let progressPercent = 100;
  if (nextLevel) {
    const range = nextLevel.min - currentLevel.min;
    const progress = currentPoints - currentLevel.min;
    progressPercent = Math.min(100, Math.max(0, (progress / range) * 100));
  }

  const openSubmission = (task: Task) => {
    setSubmissionTask(task);
    setSubmissionFeedback('');
    setSubmissionMedia(null);
    setSubmissionMediaType('image');
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubmissionMedia(reader.result as string);
        setSubmissionMediaType(isVideo ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const submitTask = () => {
    if (!submissionTask) return;
    onCompleteTask(submissionTask.id, submissionMedia || undefined, submissionMediaType, submissionFeedback);
    setSubmissionTask(null);
    setCelebration(true);
    setTimeout(() => setCelebration(false), 3000);
  };

  const handleRedeem = (reward: Reward) => {
    if (currentPoints >= reward.cost) {
      if(confirm(`确定要花 ${reward.cost} 积分兑换 "${reward.title}" 吗？`)) {
        onRedeemReward(reward);
        setCelebration(true);
        setTimeout(() => setCelebration(false), 3000);
      }
    } else {
      alert("积分不够哦，继续加油！");
    }
  };

  // Helper to render a task card
  const renderTaskCard = (task: Task) => (
    <Card key={task.id} theme="child" className="bg-white hover:scale-[1.01] transition-transform">
      <div className="flex gap-3 items-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-4xl border-2 border-orange-100 shrink-0">
            {task.categoryIcon || '📝'}
        </div>
        <div className="flex-1 flex flex-col justify-between min-h-[4rem]">
            <div>
              <h3 className="text-base font-bold text-gray-800 leading-tight mb-1">{task.title}</h3>
              <p className="text-gray-400 text-xs line-clamp-1">{task.description}</p>
            </div>
            
            <div className="flex justify-between items-end mt-1">
              <div className="flex items-center gap-1 text-orange-500 font-black text-xs">
                <Gift className="w-3 h-3" /> +{task.pointsReward}
              </div>
              <Button theme="child" size="sm" onClick={() => openSubmission(task)} className="shadow-sm py-1 px-3 text-xs">
                完成!
              </Button>
            </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col h-full bg-orange-50 relative overflow-hidden">
      
      {/* Celebration Overlay */}
      {celebration && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-hidden">
           {/* Falling Stars */}
           {Array.from({ length: 20 }).map((_, i) => (
             <div 
               key={i}
               className="absolute text-3xl animate-bounce-short"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `-10%`,
                 animation: `fall ${2 + Math.random() * 2}s linear infinite`,
                 animationDelay: `${Math.random()}s`
               }}
             >
               {Math.random() > 0.5 ? '⭐' : '💰'}
             </div>
           ))}
           
           <div className="text-center animate-in zoom-in duration-500 scale-150">
             <div className="text-8xl mb-4 animate-bounce">🎉</div>
             <h2 className="text-3xl font-black text-white drop-shadow-lg">太棒了!</h2>
             <p className="text-white/90 font-bold mt-2">任务完成提交成功!</p>
           </div>
           
           <style>{`
             @keyframes fall {
               0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
               100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
             }
           `}</style>
        </div>
      )}

      {/* Header Area */}
      <div className="bg-gradient-to-br from-orange-400 to-red-400 p-6 pb-8 rounded-b-[40px] shadow-lg z-10 relative overflow-hidden shrink-0">
         <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

         <div className="flex justify-between items-start text-white mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={currentUser.avatar} className="w-14 h-14 rounded-full border-4 border-white/30 bg-white/20 shadow-md" />
                <div className="absolute -bottom-1 -right-1 bg-white text-kid-orange rounded-full p-1 shadow-sm">
                   {currentLevelIndex > 2 ? <Crown size={12} fill="gold" className="text-yellow-500"/> : <Star size={12} fill="orange" />}
                </div>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wide">{currentUser.name}</h1>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full w-fit mt-1 text-[10px] font-bold bg-black/20 text-white/90`}>
                   {currentLevel.name}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
               <div className="bg-white text-orange-500 px-3 py-1.5 rounded-2xl font-black text-xl shadow-cartoon flex items-center gap-2 transform rotate-2 border-b-4 border-orange-200">
                 <Star className="fill-orange-500 w-5 h-5" />
                 {currentPoints}
               </div>
            </div>
         </div>

         {/* Level Progress */}
         <div className="relative z-10 mt-1">
            <div className="flex justify-between text-white/90 text-[10px] font-bold mb-1 px-1">
              <span>Lv.{currentLevelIndex + 1}</span>
              <span>{nextLevel ? `还差 ${nextLevel.min - currentPoints} 分升级` : 'MAX'}</span>
            </div>
            <div className="h-3 bg-black/20 rounded-full p-0.5 backdrop-blur-sm overflow-hidden">
               <div 
                 className="h-full bg-yellow-300 rounded-full transition-all duration-1000 ease-out shadow-sm"
                 style={{ width: `${progressPercent}%` }}
               ></div>
            </div>
         </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex justify-center -mt-6 z-20 px-4 gap-2 shrink-0">
         {[
           { id: 'missions', label: '任务', icon: <CheckCircle size={16}/> },
           { id: 'store', label: '商城', icon: <Store size={16}/> },
           { id: 'history', label: '时光', icon: <ScrollText size={16}/> },
           { id: 'rank', label: '排行', icon: <Trophy size={16}/> }
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex-1 py-3 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-0.5 shadow-md text-[10px]
               ${activeTab === tab.id 
                 ? 'bg-white text-orange-500 translate-y-0 z-10 ring-2 ring-orange-100' 
                 : 'bg-white/90 text-gray-400 translate-y-1'}`}
           >
             {tab.icon}
             {tab.label}
           </button>
         ))}
      </div>

      {/* Content Area - Added min-h-0 for scroll */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6 mt-2 min-h-0">
        
        {/* --- MISSIONS TAB --- */}
        {activeTab === 'missions' && !showDailyDetail && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            {waitingTasks.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 shadow-sm">
                <h3 className="font-bold text-blue-500 mb-2 flex items-center gap-2 text-xs">
                  <Clock size={14} /> 等待检查
                </h3>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {waitingTasks.map(task => (
                    <div key={task.id} className="bg-white px-3 py-2 rounded-xl min-w-[120px] shadow-sm flex items-center gap-2">
                       <span className="text-lg">{task.categoryIcon || '📝'}</span>
                       <span className="font-bold text-gray-700 text-xs truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 ml-1 mt-2">
               <h2 className="text-lg font-black text-gray-800">今日挑战</h2>
            </div>
            
            {/* Daily Routine Summary Card */}
            {dailyTotal > 0 && (
              <div 
                onClick={() => setShowDailyDetail(true)}
                className="bg-gradient-to-r from-blue-400 to-cyan-300 rounded-3xl p-5 shadow-cartoon border-2 border-white text-white relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform active:scale-95"
              >
                  <div className="relative z-10 flex justify-between items-center mb-3">
                     <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                          <Clock size={24} className="text-white"/>
                        </div>
                        <div>
                          <h3 className="font-black text-xl">每日任务</h3>
                          <p className="text-xs font-bold text-white/80">共 {dailyTotal} 个任务</p>
                        </div>
                     </div>
                     <ChevronLeft className="rotate-180" />
                  </div>
                  
                  <div className="relative z-10">
                     <div className="flex justify-between text-xs font-bold mb-1">
                        <span>完成进度</span>
                        <span>{dailyProgress}%</span>
                     </div>
                     <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-500" style={{width: `${dailyProgress}%`}}></div>
                     </div>
                  </div>

                  <Sun size={120} className="absolute -right-6 -top-6 text-white/10" />
              </div>
            )}

            {/* Single Tasks Section */}
            {singleTasksPending.length > 0 && (
               <div className="space-y-3 mt-4">
                  <div className="text-xs font-bold px-3 py-1 rounded-full w-fit bg-gray-100 text-gray-500">
                    📌 单次挑战
                  </div>
                  {singleTasksPending.map(task => renderTaskCard(task))}
               </div>
            )}

            {dailyTotal === 0 && singleTasksPending.length === 0 && waitingTasks.length === 0 && (
              <div className="text-center py-12 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                <Trophy size={48} className="mb-2 text-orange-300" />
                <p className="font-bold text-gray-600">全部搞定啦！</p>
                <p className="text-xs text-orange-500 mt-1">去商城逛逛吧！</p>
              </div>
            )}
          </div>
        )}

        {/* --- DAILY DETAIL VIEW --- */}
        {activeTab === 'missions' && showDailyDetail && (
           <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <button 
                onClick={() => setShowDailyDetail(false)}
                className="flex items-center gap-1 text-gray-500 font-bold mb-2 active:opacity-60"
              >
                 <ChevronLeft size={20} /> 返回
              </button>

              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-4">
                 <h2 className="text-2xl font-black text-gray-800 mb-1">每日任务清单</h2>
                 <p className="text-xs text-gray-400">按时完成，养成好习惯！</p>
              </div>

              {/* Grouped Lists */}
              {(['MORNING', 'NOON', 'AFTERNOON', 'EVENING'] as TimeSlot[]).map(slot => {
                  const tasksInSlot = groupedPendingTasks[slot];
                  if (!tasksInSlot || tasksInSlot.length === 0) return null;
                  const config = TIME_SLOT_CONFIG[slot];
                  
                  return (
                    <div key={slot} className="space-y-2">
                       <div className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${config.color} flex items-center gap-1`}>
                          {config.icon} {config.label}
                       </div>
                       {tasksInSlot.map(task => renderTaskCard(task))}
                    </div>
                  )
               })}
               
               {dailyTasksPending.length === 0 && (
                  <div className="text-center py-12">
                     <p className="text-gray-400 font-bold">今天的日常任务都完成啦！🌟</p>
                  </div>
               )}
           </div>
        )}

        {/* --- STORE TAB --- */}
        {activeTab === 'store' && (
           <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="bg-gradient-to-r from-purple-400 to-indigo-400 p-5 rounded-3xl text-white shadow-md flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                   <p className="text-xs font-bold opacity-80 mb-1">我的小金库</p>
                   <p className="text-4xl font-black flex items-center gap-2"><Star fill="white" size={32}/> {currentPoints}</p>
                </div>
                <ShoppingBag size={80} className="absolute -right-4 -bottom-4 opacity-20 rotate-12"/>
             </div>

             <h3 className="font-black text-gray-800 text-lg ml-1">奖励兑换</h3>

             <div className="grid grid-cols-2 gap-3">
               {rewards.map(reward => {
                 const canAfford = currentPoints >= reward.cost;
                 return (
                   <div key={reward.id} className={`bg-white p-3 rounded-2xl shadow-sm border-b-4 ${canAfford ? 'border-orange-100' : 'border-gray-100 opacity-60'} flex flex-col items-center text-center relative overflow-hidden`}>
                      <div className="text-5xl mb-3 mt-2">{reward.icon}</div>
                      <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{reward.title}</h3>
                      <div className="text-orange-500 font-black text-lg mb-3">{reward.cost} 分</div>
                      <Button 
                        theme="child" 
                        size="sm" 
                        className={`w-full py-2 text-xs font-bold ${!canAfford && 'bg-gray-300 border-gray-400'}`}
                        disabled={!canAfford}
                        onClick={() => handleRedeem(reward)}
                      >
                        {canAfford ? '兑换' : '积分不足'}
                      </Button>
                   </div>
                 );
               })}
             </div>
             
             {rewards.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                   <Store size={40} className="mx-auto mb-2 opacity-50" />
                   <p>家长还没有上架商品哦~</p>
                </div>
             )}
           </div>
        )}

        {/* --- HISTORY/MOMENTS TAB --- */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100 flex items-center justify-between">
               <div>
                 <h3 className="text-xl font-black text-orange-900 mb-1">时光记录</h3>
                 <p className="text-xs text-orange-400 font-bold">你已经完成了 {completedTasks.length} 个挑战！</p>
               </div>
               <ScrollText size={40} className="text-orange-200" />
            </div>
            
            <div className="relative border-l-4 border-orange-100 ml-4 space-y-8 pl-6 py-2">
               {completedTasks.map((task, index) => (
                 <div key={task.id} className="relative bg-white p-4 rounded-2xl shadow-cartoon border border-orange-100">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[35px] top-6 w-5 h-5 rounded-full bg-orange-400 border-4 border-white shadow-sm"></div>
                    
                    {/* Header: Date & Points */}
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-50">
                       <div className="text-xs font-bold text-gray-400 flex items-center gap-1">
                         <Clock size={12} />
                         {new Date(task.completedAt!).toLocaleString()}
                       </div>
                       <div className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-1">
                          <Gift size={12} /> +{task.pointsReward}
                       </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex gap-3 mb-3">
                       <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-3xl shrink-0">
                          {task.categoryIcon || '📝'}
                       </div>
                       <div>
                          <h3 className="font-bold text-gray-800 text-lg leading-tight">{task.title}</h3>
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{task.description}</p>
                       </div>
                    </div>
                    
                    {/* Media Display */}
                    {(task.proofImage || task.childProofImage) && (
                      <div className="w-full rounded-xl overflow-hidden mb-3 border border-gray-100 bg-gray-50 shadow-inner">
                        {/* Prefer proofMediaType (parent's approved type) or childProofMediaType */}
                        {(task.proofMediaType === 'video' || (!task.proofMediaType && task.childProofMediaType === 'video')) ? (
                           <video 
                             src={task.proofImage || task.childProofImage} 
                             controls 
                             className="w-full h-40 object-cover"
                           />
                        ) : (
                           <img 
                             src={task.proofImage || task.childProofImage} 
                             className="w-full h-full object-cover" 
                           />
                        )}
                      </div>
                    )}
                    
                    {/* Parent Feedback */}
                    {task.feedback && (
                      <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-800 flex gap-2">
                        <MessageCircle size={16} className="shrink-0 mt-0.5" />
                        <div>
                           <span className="font-black block mb-1">家长说:</span>
                           "{task.feedback}"
                        </div>
                      </div>
                    )}
                 </div>
               ))}

               {completedTasks.length === 0 && (
                 <div className="text-center text-gray-400 py-10">
                   <p>还没有完成的任务哦，加油！</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* --- LEADERBOARD TAB --- */}
        {activeTab === 'rank' && (
          <div className="animate-in slide-in-from-right duration-300 space-y-3">
             {allChildren
                .sort((a,b) => (b.points || 0) - (a.points || 0))
                .map((child, index) => (
                  <div key={child.id} className={`flex items-center p-4 rounded-2xl shadow-sm border ${child.id === currentUser.id ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
                      <div className="w-8 text-center font-black text-xl italic text-gray-300 mr-2">
                        {index === 0 ? <Crown className="mx-auto text-yellow-500 fill-yellow-200 animate-bounce-short"/> : index + 1}
                      </div>
                      <img src={child.avatar} className="w-10 h-10 rounded-full bg-gray-100 mr-3" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{child.name}</h3>
                        <p className="text-[10px] text-gray-400">{LEVELS.find((l, i) => (child.points || 0) >= l.min && (LEVELS[i+1] ? (child.points || 0) < LEVELS[i+1].min : true))?.name}</p>
                      </div>
                      <span className="font-black text-orange-500 text-lg">{child.points || 0}</span>
                  </div>
              ))}
          </div>
        )}

      </div>

      {/* SUBMISSION MODAL */}
      {submissionTask && (
         <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto relative">
              <button 
                onClick={() => setSubmissionTask(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X size={16} />
              </button>

              <div className="text-center mb-6 mt-2">
                <span className="text-4xl block mb-2">{submissionTask.categoryIcon || '📝'}</span>
                <h3 className="text-lg font-black text-gray-800">完成了 "{submissionTask.title}"?</h3>
                <p className="text-xs text-gray-500 mt-1">太棒了！告诉爸爸妈妈你做得怎么样</p>
              </div>

              <div className="space-y-4">
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden relative"
                  >
                      {submissionMedia ? (
                        submissionMediaType === 'video' ? (
                          <video src={submissionMedia} className="w-full h-full object-cover" controls />
                        ) : (
                          <img src={submissionMedia} className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="flex flex-col items-center text-orange-300">
                          <Camera size={24} />
                          <span className="text-xs mt-2 font-bold">拍照片或短视频 (可选)</span>
                        </div>
                      )}
                      <input type="file" accept="image/*,video/*" ref={fileInputRef} className="hidden" onChange={handleMediaUpload} />
                  </div>

                  <Input 
                    placeholder="我想说..." 
                    value={submissionFeedback}
                    onChange={(e) => setSubmissionFeedback(e.target.value)}
                    className="bg-gray-50 border-0 focus:ring-1 focus:ring-orange-200"
                  />

                  <Button className="w-full py-4 bg-orange-500 text-white shadow-lg shadow-orange-200" onClick={submitTask}>
                     确认完成
                  </Button>
              </div>
           </div>
         </div>
      )}

    </div>
  );
};
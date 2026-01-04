import React, { useState, useEffect } from 'react';
import { User, Task, Role, Family, TaskStatus, Reward } from './types';
import { ParentView } from './components/ParentView';
import { ChildView } from './components/ChildView';
import { LogOut, PlusCircle } from './components/Icons';
import { Button, Input } from './components/Common';
import { generateId, getRandomAvatar, DEFAULT_REWARDS } from './constants';

const STORAGE_KEY = 'family_quest_v3'; 

// Setup Wizard Components
const SetupWizard: React.FC<{ onComplete: (family: Family) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState('');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');

  const handleFinish = () => {
    const parentId = generateId('p_');
    const childId = generateId('c_');
    
    const newFamily: Family = {
      id: generateId('fam_'),
      name: familyName,
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      members: [
        {
          id: parentId,
          name: parentName,
          role: Role.PARENT,
          avatar: getRandomAvatar(Role.PARENT)
        },
        {
          id: childId,
          name: childName,
          role: Role.CHILD,
          avatar: getRandomAvatar(Role.CHILD),
          points: 0
        }
      ],
      rewards: DEFAULT_REWARDS
    };
    onComplete(newFamily);
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="bg-white text-gray-800 p-8 rounded-[40px] w-full max-w-sm shadow-2xl">
        <h1 className="text-2xl font-black mb-2 text-center text-gray-900">欢迎来到<br/>家庭管家</h1>
        <p className="text-center text-gray-400 text-sm mb-8">几步简单设置，开启亲子成长之旅</p>
        
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <p className="text-center text-gray-600 font-bold">给你们的小队起个名字</p>
             <Input placeholder="例如：超人特工队" value={familyName} onChange={e => setFamilyName(e.target.value)} autoFocus className="text-center text-lg"/>
             <Button className="w-full mt-4 bg-black text-white rounded-full py-4" onClick={() => setStep(2)} disabled={!familyName}>下一步</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <p className="text-center text-gray-600 font-bold">家长怎么称呼？</p>
             <Input placeholder="例如：爸爸 / 妈妈" value={parentName} onChange={e => setParentName(e.target.value)} autoFocus className="text-center text-lg" />
             <Button className="w-full mt-4 bg-black text-white rounded-full py-4" onClick={() => setStep(3)} disabled={!parentName}>下一步</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <p className="text-center text-gray-600 font-bold">第一个孩子的名字</p>
             <Input placeholder="例如：乐乐" value={childName} onChange={e => setChildName(e.target.value)} autoFocus className="text-center text-lg" />
             <Button className="w-full mt-4 bg-black text-white rounded-full py-4" onClick={handleFinish} disabled={!childName}>完成设置</Button>
          </div>
        )}
        
        <div className="flex justify-center mt-6 gap-2">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'w-8 bg-black' : 'w-2 bg-gray-200'}`}></div>
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'w-8 bg-black' : 'w-2 bg-gray-200'}`}></div>
          <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'w-8 bg-black' : 'w-2 bg-gray-200'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [family, setFamily] = useState<Family | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isAddMemberMode, setIsAddMemberMode] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  // --- Persistence ---

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const loadedFamily = data.family;
        
        // Ensure rewards exist (migration for existing users)
        if (!loadedFamily.rewards || loadedFamily.rewards.length === 0) {
            loadedFamily.rewards = DEFAULT_REWARDS;
        }

        setFamily(loadedFamily);
        setTasks(data.tasks);
        setRewards(loadedFamily.rewards);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    setIsLoading(false);
  }, []);

  const saveData = (newFamily: Family, newTasks: Task[]) => {
    const familyToSave = { ...newFamily, rewards: rewards }; 
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ family: familyToSave, tasks: newTasks }));
    setFamily(familyToSave);
    setTasks(newTasks);
  };
  
  useEffect(() => {
    if (family && family.rewards) {
      setRewards(family.rewards);
    }
  }, [family]);

  // --- Actions ---

  const handleSetupComplete = (newFamily: Family) => {
    saveData(newFamily, []);
    setRewards(newFamily.rewards || []);
  };

  const handleLogin = (userId: string) => {
    const user = family?.members.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddChild = () => {
    if (!newMemberName || !family) return;
    const newChild: User = {
      id: generateId('c_'),
      name: newMemberName,
      role: Role.CHILD,
      avatar: getRandomAvatar(Role.CHILD),
      points: 0
    };
    const updatedFamily = { ...family, members: [...family.members, newChild] };
    saveData(updatedFamily, tasks);
    setNewMemberName('');
    setIsAddMemberMode(false);
  };

  // Task CRUD

  const addTask = (taskData: Omit<Task, 'id' | 'status' | 'createdBy'>) => {
    if (!currentUser || !family) return;
    const newTask: Task = {
      ...taskData,
      id: generateId('t_'),
      status: TaskStatus.PENDING,
      createdBy: currentUser.id,
    };
    saveData(family, [newTask, ...tasks]);
  };

  // NEW: Batch add tasks to fix race condition in daily plan
  const addTasks = (tasksData: Omit<Task, 'id' | 'status' | 'createdBy'>[]) => {
    if (!currentUser || !family) return;
    const newTasks = tasksData.map(t => ({
      ...t,
      id: generateId('t_'),
      status: TaskStatus.PENDING,
      createdBy: currentUser.id,
    }));
    saveData(family, [...newTasks, ...tasks]);
  };

  // Updated to support feedback and photo/video from child
  const completeTask = (taskId: string, proofMedia?: string, mediaType?: 'image' | 'video', feedback?: string) => {
    if (!family) return;
    const updatedTasks = tasks.map(t => 
      t.id === taskId 
        ? { 
            ...t, 
            status: TaskStatus.WAITING_VERIFICATION, 
            completedAt: new Date().toISOString(),
            childProofImage: proofMedia,
            childProofMediaType: mediaType,
            childFeedback: feedback
          } 
        : t
    );
    saveData(family, updatedTasks);
  };

  const verifyTask = (taskId: string, approved: boolean, feedback: string, proofImage?: string, points?: number) => {
    if (!family) return;
    
    let updatedFamily = { ...family };

    // Update Task
    const updatedTasks = tasks.map(t => {
      if (t.id !== taskId) return t;
      
      const finalProof = proofImage || t.proofImage || (approved ? t.childProofImage : undefined);
      const finalType = proofImage ? 'image' : (t.proofMediaType || (approved ? t.childProofMediaType : undefined));

      return {
        ...t,
        status: approved ? TaskStatus.COMPLETED : TaskStatus.FAILED,
        verifiedAt: new Date().toISOString(),
        feedback,
        proofImage: finalProof,
        proofMediaType: finalType,
      };
    });

    // Update Points
    if (approved && points) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        updatedFamily.members = updatedFamily.members.map(m => {
          if (m.id === task.assignedToId) {
            return { ...m, points: (m.points || 0) + points };
          }
          return m;
        });
      }
    }

    saveData(updatedFamily, updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    if (!family) return;
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    saveData(family, updatedTasks);
  };

  const deleteMemory = (taskId: string) => {
     if (!family) return;
     const updatedTasks = tasks.map(t => {
        if(t.id === taskId) {
           return { ...t, proofImage: undefined, proofMediaType: undefined };
        }
        return t;
     });
     saveData(family, updatedTasks);
  };

  // Rewards Actions

  const addReward = (reward: Omit<Reward, 'id'>) => {
    if(!family) return;
    const newReward = { ...reward, id: generateId('r_') };
    const newRewards = [...rewards, newReward];
    setRewards(newRewards);
    const updatedFamily = { ...family, rewards: newRewards };
    saveData(updatedFamily, tasks);
  };

  const deleteReward = (rewardId: string) => {
    if(!family) return;
    const newRewards = rewards.filter(r => r.id !== rewardId);
    setRewards(newRewards);
    const updatedFamily = { ...family, rewards: newRewards };
    saveData(updatedFamily, tasks);
  };

  const redeemReward = (reward: Reward) => {
    if(!family || !currentUser) return;
    
    // Deduct points
    const updatedFamily = { ...family };
    updatedFamily.members = updatedFamily.members.map(m => {
      if(m.id === currentUser.id) {
         return { ...m, points: Math.max(0, (m.points || 0) - reward.cost) };
      }
      return m;
    });
    saveData(updatedFamily, tasks);
  };

  // --- Render ---

  if (isLoading) return <div className="h-full w-full flex items-center justify-center bg-white">Loading...</div>;

  if (!family) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  if (!currentUser) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-6 text-white overflow-y-auto">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-[40px] w-full max-w-sm shadow-2xl border border-white/20 my-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg">
              🏰
            </div>
            <h1 className="text-2xl font-black font-sans mb-1">{family.name}</h1>
            <p className="text-white/80 text-sm">选择角色登录</p>
          </div>
          
          <div className="space-y-3 mb-6">
            {family.members.map(user => (
              <button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                className="w-full flex items-center gap-4 bg-white text-gray-800 p-3 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg active:scale-95"
              >
                <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-white bg-gray-100" />
                <div className="text-left flex-1">
                  <p className="font-bold text-lg">{user.name}</p>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                    {user.role === Role.PARENT ? '家长 (管理员)' : '孩子'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {!isAddMemberMode ? (
            <button 
              onClick={() => setIsAddMemberMode(true)}
              className="w-full py-3 border-2 border-white/30 rounded-2xl text-white/70 font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} /> 添加家庭成员
            </button>
          ) : (
             <div className="bg-white/90 p-4 rounded-2xl animate-in slide-in-from-bottom text-gray-800">
                <Input 
                  placeholder="新成员名字" 
                  value={newMemberName} 
                  onChange={e => setNewMemberName(e.target.value)}
                  className="mb-3"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setIsAddMemberMode(false)} className="flex-1">取消</Button>
                  <Button size="sm" onClick={handleAddChild} className="flex-1 bg-black text-white" disabled={!newMemberName}>确认添加</Button>
                </div>
             </div>
          )}

          <div className="mt-8 text-center text-xs text-white/50">
            家庭码: {family.code}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
      
      {currentUser.role === Role.PARENT ? (
        <ParentView 
          currentUser={currentUser}
          childrenUsers={family.members.filter(m => m.role === Role.CHILD)}
          tasks={tasks}
          rewards={rewards}
          onAddTask={addTask}
          onAddTasks={addTasks} // Pass batch function
          onVerifyTask={verifyTask}
          onDeleteTask={deleteTask}
          onDeleteMemory={deleteMemory}
          onAddReward={addReward}
          onDeleteReward={deleteReward}
        />
      ) : (
        <ChildView 
          currentUser={family.members.find(m => m.id === currentUser.id) || currentUser} 
          allChildren={family.members.filter(m => m.role === Role.CHILD)}
          tasks={tasks}
          rewards={rewards}
          onCompleteTask={completeTask}
          onRedeemReward={redeemReward}
        />
      )}

      {/* Floating Logout */}
      <button 
        onClick={handleLogout}
        className="fixed bottom-6 left-6 w-10 h-10 bg-black/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm z-50 hover:bg-black/40 active:scale-90 transition-transform"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
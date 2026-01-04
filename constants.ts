import { User, Role, Reward, TimeSlot } from './types';

export const generateId = (prefix: string = '') => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const PARENT_AVATARS = [
  'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=e5e7eb',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka&backgroundColor=ffedd5',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Jude&backgroundColor=dbeafe',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Robert&backgroundColor=f3f4f6'
];

export const CHILD_AVATARS = [
  'https://api.dicebear.com/9.x/notionists/svg?seed=Milo&backgroundColor=ffedd5',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Ginger&backgroundColor=fee2e2',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Scooter&backgroundColor=dcfce7',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Cookie&backgroundColor=fff7ed',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Bear&backgroundColor=fef3c7'
];

export const getRandomAvatar = (role: Role) => {
  const list = role === Role.PARENT ? PARENT_AVATARS : CHILD_AVATARS;
  return list[Math.floor(Math.random() * list.length)];
};

export const TASK_PRESETS = [
  { icon: '📚', title: '完成作业', desc: '认真完成学校布置的作业，字迹工整' },
  { icon: '🧹', title: '整理房间', desc: '把玩具归位，整理床铺' },
  { icon: '🎹', title: '乐器练习', desc: '专注练习30分钟' },
  { icon: '🦷', title: '早晚刷牙', desc: '刷够2分钟，保持牙齿亮白' },
  { icon: '🏃', title: '户外运动', desc: '跳绳、跑步或打球30分钟' },
  { icon: '🥛', title: '喝水打卡', desc: '今天喝够8杯水了吗？' },
  { icon: '🍽️', title: '光盘行动', desc: '吃饭不挑食，把碗里的饭吃干净' },
  { icon: '📖', title: '阅读时光', desc: '安静阅读绘本或书籍20分钟' },
];

export const TIME_SLOT_CONFIG: Record<TimeSlot, { label: string, color: string, icon: string, presets: typeof TASK_PRESETS }> = {
  'MORNING': {
    label: '活力早晨',
    color: 'bg-orange-100 text-orange-600',
    icon: '🌅',
    presets: [
      { icon: '🦷', title: '刷牙洗脸', desc: '把自己收拾得干干净净' },
      { icon: '🥛', title: '喝杯温水', desc: '晨起一杯水，健康一整天' },
      { icon: '🎒', title: '整理书包', desc: '检查课本作业是否带齐' },
      { icon: '🥪', title: '吃光早餐', desc: '补充能量，不挑食' }
    ]
  },
  'NOON': {
    label: '午间时光',
    color: 'bg-yellow-100 text-yellow-600',
    icon: '☀️',
    presets: [
      { icon: '🍚', title: '午餐光盘', desc: '珍惜粮食，吃得饱饱的' },
      { icon: '😴', title: '午休小憩', desc: '休息30分钟，下午更有精神' },
      { icon: '👀', title: '眼保健操', desc: '保护视力，放松眼睛' }
    ]
  },
  'AFTERNOON': {
    label: '充实午后',
    color: 'bg-blue-100 text-blue-600',
    icon: '🌤️',
    presets: [
      { icon: '📚', title: '完成作业', desc: '专注高效，字迹工整' },
      { icon: '🏃', title: '户外运动', desc: '跳绳/跑步/球类运动30分钟' },
      { icon: '🎹', title: '兴趣练习', desc: '练琴/画画/书法' },
      { icon: '🧹', title: '家务帮手', desc: '帮忙倒垃圾或扫地' }
    ]
  },
  'EVENING': {
    label: '温馨夜晚',
    color: 'bg-indigo-100 text-indigo-600',
    icon: '🌙',
    presets: [
      { icon: '🚿', title: '洗澡洗漱', desc: '讲究卫生，香喷喷' },
      { icon: '📖', title: '亲子阅读', desc: '和爸爸妈妈一起看书' },
      { icon: '👗', title: '准备衣物', desc: '准备好明天的衣服' },
      { icon: '🛌', title: '按时睡觉', desc: '早睡早起身体好' }
    ]
  }
};

export const DEFAULT_REWARDS: Reward[] = [
  { id: 'r_1', title: '看电视30分钟', cost: 50, icon: '📺' },
  { id: 'r_2', title: '购买小玩具', cost: 300, icon: '🧸' },
  { id: 'r_3', title: '去公园玩', cost: 150, icon: '🛝' },
  { id: 'r_4', title: '吃个冰淇淋', cost: 100, icon: '🍦' },
  { id: 'r_5', title: '玩手机游戏', cost: 80, icon: '🎮' },
  { id: 'r_6', title: '免做一次家务', cost: 200, icon: '🎫' },
];
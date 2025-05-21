import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { getIcon } from '../utils/iconUtils';

const WaitlistEntry = ({ entry, onNotify, onSeat, onEdit, onRemove }) => {
  const [waitTime, setWaitTime] = useState('');
  
  // Icons
  const UserIcon = getIcon('user');
  const UsersIcon = getIcon('users');
  const BellIcon = getIcon('bell');
  const BellOffIcon = getIcon('bell-off');
  const EditIcon = getIcon('edit');
  const CheckIcon = getIcon('check');
  const XIcon = getIcon('x');
  const PhoneIcon = getIcon('phone');
  const ClockIcon = getIcon('clock');
  
  // Update wait time every minute
  useEffect(() => {
    const updateWaitTime = () => {
      try {
        setWaitTime(formatDistanceToNow(new Date(entry.timeAdded), { addSuffix: false }));
      } catch (error) {
        setWaitTime('unknown');
      }
    };
    
    updateWaitTime();
    const interval = setInterval(updateWaitTime, 60000);
    
    return () => clearInterval(interval);
  }, [entry.timeAdded]);
  
  return (
    <div className={`card p-4 mb-3 ${entry.notified ? 'border-l-4 border-blue-500' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center 
            ${entry.notified 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
            {entry.partySize > 1 ? <UsersIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
          </div>
          <div className="ml-3">
            <h4 className="font-medium">{entry.customerName}</h4>
            <div className="flex items-center text-sm text-surface-500">
              <PhoneIcon className="w-3 h-3 mr-1" />
              <span>{entry.phoneNumber}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={() => onNotify(entry)}
            className={`p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 ${entry.notified ? 'text-blue-500' : 'text-yellow-500'}`}
            disabled={entry.notified}
            title={entry.notified ? 'Already Notified' : 'Notify Customer'}>
            {entry.notified ? <BellOffIcon className="w-4 h-4" /> : <BellIcon className="w-4 h-4" />}
          </button>
          <button onClick={() => onSeat(entry)} className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 text-green-500" title="Seat Customer">
            <CheckIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(entry)} className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700" title="Edit">
            <EditIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onRemove(entry)} className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 text-red-500" title="Remove">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2 text-sm">
        <div className="flex items-center">
          <ClockIcon className="w-4 h-4 mr-1 text-surface-500" />
          <span>Waiting: <span className="font-medium">{waitTime}</span></span>
        </div>
        <div className="flex items-center">
          <div className={`px-2 py-0.5 rounded text-xs font-medium
            ${entry.partySize > 6 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
              entry.partySize > 4 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : 
              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
            {entry.partySize} {entry.partySize === 1 ? 'person' : 'people'}
          </div>
        </div>
      </div>
      
      {entry.notes && (
        <div className="mt-2 text-sm text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-700 p-2 rounded">
          {entry.notes}
        </div>
      )}
    </div>
  );
};

export default WaitlistEntry;
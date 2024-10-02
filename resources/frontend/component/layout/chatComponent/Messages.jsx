import React from 'react';

const Message = ({ message, sender, timestamp, isOwnMessage }) => {
  return (
    <div
      className={`flex items-start space-x-3 my-2 ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
            {sender.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      <div
        className={`max-w-xs md:max-w-sm lg:max-w-md p-3 rounded-lg shadow-md ${
          isOwnMessage
            ? 'bg-blue-500 text-white self-end'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        <p className="text-sm font-semibold">
          {!isOwnMessage && sender}
        </p>
        <p className="text-sm">{message}</p>
        <span className="text-xs text-gray-500 mt-1 block text-right">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

export default Message;

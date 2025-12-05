import React from 'react';

const ChequeTemplate = ({ data, isPreview }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={`border-2 border-gray-700 p-6 bg-white w-full max-w-3xl mx-auto ${isPreview ? 'shadow-md' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold">Cheque #: {data.chequeNumber}</span>
        <span className="text-sm font-semibold">{formatDate(data.date)}</span>
      </div>

      <div className="border-b border-gray-400 py-2 mb-2">
        <span className="text-sm">Pay to the Order of</span>
        <div className="text-xl font-bold">{data.payTo}</div>
      </div>

      <div className="flex justify-between items-center border-b border-gray-400 py-2 mb-2">
        <span className="text-sm font-medium">{data.amountInWords}</span>
        <span className="text-xl font-semibold">{data.amount}</span>
      </div>

      <div className="text-sm italic mb-2">Memo: {data.memo}</div>

      <div className="flex justify-between mt-6 text-xs font-mono tracking-wide">
        <div>
          <div>Routing Number</div>
          <div className="text-lg font-bold">{data.routingNumber}</div>
        </div>
        <div>
          <div>Account Number</div>
          <div className="text-lg font-bold">{data.accountNumber}</div>
        </div>
      </div>
    </div>
  );
};

export default ChequeTemplate;

import React from 'react';

const MathCard = ({ currency, onCurrencyChange, amount, onAmountChange, fxRateText, convertedTotal }) => {
  return (
    <div className="col-span-12 bg-surface-container border border-outline-variant p-6 flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-8 rounded-lg">
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <label className="font-label-md text-label-md text-secondary font-semibold">Currency</label>
        <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)} className="bg-transparent border-none text-headline-sm font-headline-sm text-on-surface font-semibold focus:ring-0 cursor-pointer p-0 w-24">
          <option value="AED">د.إ AED</option>
          <option value="EUR">€ EUR</option>
          <option value="USD">$ USD</option>
          <option value="TL">₺ TL</option>
          <option value="CNY">¥ CNY</option>
        </select>
      </div>
      <div className="w-[1px] h-10 bg-outline-variant hidden md:block" />
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <label className="font-label-md text-label-md text-secondary font-semibold">Amount</label>
        <input type="number" step="0.01" value={amount} onChange={(e) => onAmountChange(e.target.value)} className="bg-transparent border-none text-headline-sm font-headline-sm text-on-surface font-semibold focus:ring-0 p-0 w-32 outline-none" />
      </div>
      <div className="flex items-center justify-center bg-primary-container text-on-primary-container w-10 h-10 rounded-full select-none">
        <span className="material-symbols-outlined">close</span>
      </div>
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <label className="font-label-md text-label-md text-secondary font-semibold">FX Rate</label>
        <div className="font-headline-sm text-headline-sm text-primary font-bold">{fxRateText}</div>
      </div>
      <div className="hidden md:flex items-center text-secondary select-none">
        <span className="material-symbols-outlined text-[32px]">drag_handle</span>
      </div>
      <div className="flex flex-col items-end gap-1 bg-surface-container-highest p-4 px-8 border border-primary/20 rounded w-full md:w-auto">
        <label className="font-label-md text-label-md text-primary font-bold">Converted Total</label>
        <div className="font-headline-md text-headline-md text-primary font-bold">{convertedTotal} AED</div>
      </div>
    </div>
  );
};

export default MathCard;

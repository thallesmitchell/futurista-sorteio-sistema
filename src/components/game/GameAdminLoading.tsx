
import React from 'react';

export const GameAdminLoading = () => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="animate-pulse h-16 bg-muted rounded-lg mb-4" />
      <div className="animate-pulse h-[200px] bg-muted rounded-lg" />
    </div>
  );
};

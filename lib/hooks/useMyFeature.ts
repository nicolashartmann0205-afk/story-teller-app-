import React, { useState, useEffect } from 'react';

// @param initialValue - Optional initial value for the hook's state.
export const useMyFeature = (initialValue?: any) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Logic for the hook goes here
    console.log(`MyFeature hook initialized.`);
  }, []);

  return [state, setState] as const;
};


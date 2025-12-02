import { useState, useEffect, useActionState } from 'react';

export const useCustomTest = (initialVal: string) => {
  const [state, setState] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Hook logic goes here
    console.log(`Hook 'CustomTest' initialized with argument: ${initialVal}`);
  }, [initialVal]);

  return { state, isLoading, setState };
};


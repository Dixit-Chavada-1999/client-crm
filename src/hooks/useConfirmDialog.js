import { useState, useCallback } from 'react';

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [onConfirmCallback, setOnConfirmCallback] = useState(null);

  const openConfirmDialog = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setConfig(options);
      setOnConfirmCallback(() => () => {
        resolve(true);
      });
      setIsOpen(true);
    });
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setIsOpen(false);
    setConfig({});
    setOnConfirmCallback(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (onConfirmCallback) {
      await onConfirmCallback();
    }
    closeConfirmDialog();
  }, [onConfirmCallback, closeConfirmDialog]);

  return {
    isOpen,
    config,
    openConfirmDialog,
    closeConfirmDialog,
    handleConfirm,
  };
}

'use client';

import React from 'react';
import { StartupTypeCard } from '@/components/StartupCard';

interface StartupCardWithCommunityProps {
  post: StartupTypeCard;
}

export default function StartupCardWithCommunity({ post }: StartupCardWithCommunityProps) {
  const { title, _id } = post;

  return (
    <div className="startup-card group">
      <h3>{title}</h3>
      <p>Startup ID: {_id}</p>
    </div>
  );
}

"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const NoSSRWrapper = (props: { children: React.ReactNode }) => (
    <div suppressHydrationWarning>{props.children}</div>
);

export default dynamic(() => Promise.resolve(NoSSRWrapper), {
    ssr: false
});

"use client"
import Link from 'next/link';
import React from 'react'
import { Button } from './ui/button';
import { SparklesIcon } from 'lucide-react';

const DashboardBtn = () => {
  const isCandidate = false;
  const isInterviewer = true;

  if(isCandidate) return null;

  return (
    <Link href="/dashboard">
      <Button className='gap-2 font-medium' size={"sm"}>
        <SparklesIcon className='siz-4'/>
        Dashboard
      </Button>
    </Link>
  )
}

export default DashboardBtn
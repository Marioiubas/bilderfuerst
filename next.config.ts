import type { NextConfig } from 'next';
const config: NextConfig = {devIndicators:false, turbopack:{root:process.cwd()}, images:{unoptimized:true}};
export default config;

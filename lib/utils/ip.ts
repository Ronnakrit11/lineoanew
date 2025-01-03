export function getClientIp(request: Request): string | null {
    // Try X-Forwarded-For header first
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      const ips = forwardedFor.split(',').map(ip => ip.trim());
      return ips[0] || null;
    }
  
    // Try X-Real-IP header next
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
      return realIp;
    }
  
    // Try to get from socket
    const socketAddr = request.headers.get('x-vercel-ip') || 
                      request.headers.get('x-now-ip');
    if (socketAddr) {
      return socketAddr;
    }
  
    return null;
  }
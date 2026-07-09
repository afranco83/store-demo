import { withAuthGuard } from "@store-demo/auth/middleware-guard";

export default withAuthGuard({ protectedPaths: ["/account"] });

export const config = {
  matcher: ["/account/:path*"],
};

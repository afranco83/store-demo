import { withAuthGuard } from "@store-demo/auth/middleware-guard";

export default withAuthGuard({ protectedPaths: ["/account", "/checkout"] });

export const config = {
  matcher: ["/account/:path*", "/checkout"],
};

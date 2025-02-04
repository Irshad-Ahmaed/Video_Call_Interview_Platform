import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <SignedOut>
        <Button variant='default' size='default'><SignInButton /></Button>
      </SignedOut>
      <SignedIn>
        <Button variant='secondary' size='icon'><UserButton /></Button>
      </SignedIn>
    </div>
  );
}

import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "@mui/joy";

function Home() {
  return (
    <React.Fragment>
      <Head>
        <title>PianoCheat</title>
      </Head>
      <div>
        <p>
          ⚡ Electron + Next.js ⚡ -<Button variant="solid">Hello world</Button>
          <Link href="/next">
            <a>Go to next page</a>
          </Link>
        </p>
        <img src="/images/logo.png" />
      </div>
    </React.Fragment>
  );
}

export default Home;

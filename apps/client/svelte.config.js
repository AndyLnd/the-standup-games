/** @type {import('@sveltejs/kit').Config} */

import preprocess from 'svelte-preprocess';
import node from '@sveltejs/adapter-node';

const config = {
  preprocess: [
    preprocess({
      preserve: ['ld+json', 'module'],
      typescript: true,
    }),
  ],
  kit: {
    adapter: node(),
  },
};

export default config;

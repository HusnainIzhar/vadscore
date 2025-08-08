# Publishing Guide for VADScore

## Pre-Publishing Checklist

1. **Build the package**:
   ```bash
   npm run build
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Check types**:
   ```bash
   npm run typecheck
   ```

4. **Test the package locally**:
   ```bash
   npm pack
   # This creates a .tgz file you can test with npm install ./vadscore-1.0.0.tgz
   ```

## Publishing to NPM

1. **Login to NPM**:
   ```bash
   npm login
   ```

2. **Publish the package**:
   ```bash
   npm publish
   ```

## Post-Publishing

1. **Test installation**:
   ```bash
   npm install vadscore
   ```

2. **Verify the package page**: Visit https://www.npmjs.com/package/vadscore

## Version Management

To publish updates:

1. Update the version in `package.json`
2. Run `npm run build`
3. Run `npm publish`

Or use npm version commands:
```bash
npm version patch  # 1.0.1
npm version minor  # 1.1.0  
npm version major  # 2.0.0
npm publish
```

## Package Contents

The published package includes:
- `dist/` - Compiled JavaScript and TypeScript definitions
- `README.md` - Comprehensive documentation
- `LICENSE` - MIT license
- `package.json` - Package metadata

## Usage After Publishing

Users can install and use your package:

```bash
npm install vadscore
```

```tsx
import { useVAD } from 'vadscore';

function MyComponent() {
  const { vadScore, isSpeaking, startListening } = useVAD();
  // ... use the VAD functionality
}
```

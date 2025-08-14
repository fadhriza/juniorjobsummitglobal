// debug.js - Run this to check your project structure
const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Next.js Project Structure...\n');

const checkFile = (filePath, description) => {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  
  if (exists) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasUseClient = content.includes("'use client'") || content.includes('"use client"');
    const hasDefaultExport = content.includes('export default');
    const hasNamedExports = content.includes('export const') || content.includes('export function');
    
    console.log(`   📄 Has 'use client': ${hasUseClient}`);
    console.log(`   📄 Has default export: ${hasDefaultExport}`);
    console.log(`   📄 Has named exports: ${hasNamedExports}`);
    
    // Check for common import issues
    const lines = content.split('\n');
    const imports = lines.filter(line => line.trim().startsWith('import'));
    if (imports.length > 0) {
      console.log(`   📦 Imports found: ${imports.length}`);
      imports.forEach(imp => {
        if (imp.includes('../') || imp.includes('./')) {
          console.log(`     - ${imp.trim()}`);
        }
      });
    }
  }
  console.log('');
};

// Check critical files
console.log('Checking critical files:\n');

checkFile('src/app/layout.tsx', 'Root Layout');
checkFile('src/app/page.tsx', 'Main Page');
checkFile('src/app/globals.css', 'Global CSS');
checkFile('src/contexts/AuthContext.tsx', 'Auth Context');
checkFile('src/components/LoginForm.tsx', 'Login Form');
checkFile('src/components/Dashboard.tsx', 'Dashboard');
checkFile('src/components/ImageWithFallback.tsx', 'Image Fallback');
checkFile('src/lib/firebase.ts', 'Firebase Config');
checkFile('src/lib/api.ts', 'API Service');
checkFile('src/types/index.ts', 'Type Definitions');

// Check API routes
console.log('Checking API routes:\n');
checkFile('src/app/api/products/route.ts', 'Products API');
checkFile('src/app/api/product/route.ts', 'Product API');
checkFile('src/app/api/image-proxy/route.ts', 'Image Proxy API');

// Check package.json dependencies
console.log('Checking package.json dependencies:\n');
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  const requiredDeps = [
    'next', 'react', 'react-dom', 'typescript', 
    'tailwindcss', 'firebase', 'axios', 'react-hot-toast',
    'lucide-react', 'react-icons', 'clsx'
  ];
  
  requiredDeps.forEach(dep => {
    const version = deps[dep];
    console.log(`${version ? '✅' : '❌'} ${dep}: ${version || 'MISSING'}`);
  });
} else {
  console.log('❌ package.json not found');
}

console.log('\n🔍 Debug complete! Check the results above for missing files or dependencies.');
console.log('\n💡 Common fixes:');
console.log('   1. Make sure all files have proper default exports');
console.log('   2. Add "use client" to client components');
console.log('   3. Check for circular imports');
console.log('   4. Verify all relative import paths are correct');
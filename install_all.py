#!/usr/bin/env python3
"""
PROGEASE - Dependency Installation Script

This script automates the installation of all npm dependencies for the PROGEASE project.
It handles the monorepo structure by installing dependencies in:
- Root directory
- Backend directory
- Frontend directory

Requirements:
- Python 3.6+
- Node.js (>=18.0.0 for backend, >=20.0.0 for frontend)
- npm (>=10.0.0)

Usage:
    python3 install_all.py [options]

Options:
    --clean     Remove node_modules before installation
    --no-root   Skip root directory installation
    --backend-only   Install only backend dependencies
    --frontend-only  Install only frontend dependencies
    --help      Show this help message
"""

import os
import sys
import subprocess
import shutil
import argparse
from pathlib import Path


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_header(message):
    """Print a formatted header message"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message.center(80)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}\n")


def print_info(message):
    """Print an info message"""
    print(f"{Colors.OKBLUE}ℹ {message}{Colors.ENDC}")


def print_success(message):
    """Print a success message"""
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")


def print_warning(message):
    """Print a warning message"""
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")


def print_error(message):
    """Print an error message"""
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")


def check_command(command, version_flag='--version'):
    """Check if a command is available and get its version"""
    try:
        result = subprocess.run(
            [command, version_flag],
            capture_output=True,
            text=True,
            check=True
        )
        return True, result.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False, None


def check_prerequisites():
    """Check if Node.js and npm are installed"""
    print_header("Checking Prerequisites")
    
    # Check Node.js
    node_available, node_version = check_command('node')
    if node_available:
        print_success(f"Node.js is installed: {node_version}")
    else:
        print_error("Node.js is not installed!")
        print_info("Please install Node.js (>=18.0.0) from https://nodejs.org/")
        return False
    
    # Check npm
    npm_available, npm_version = check_command('npm')
    if npm_available:
        print_success(f"npm is installed: {npm_version}")
    else:
        print_error("npm is not installed!")
        print_info("npm usually comes with Node.js. Please reinstall Node.js.")
        return False
    
    return True


def clean_node_modules(directory, module_name="node_modules"):
    """Remove node_modules directory"""
    module_path = os.path.join(directory, module_name)
    if os.path.exists(module_path):
        print_info(f"Removing {module_path}...")
        try:
            shutil.rmtree(module_path)
            print_success(f"Removed {module_path}")
        except Exception as e:
            print_error(f"Failed to remove {module_path}: {e}")
            return False
    return True


def run_npm_install(directory, name, use_legacy_peer_deps=False):
    """Run npm install in a directory"""
    if not os.path.exists(directory):
        print_error(f"Directory not found: {directory}")
        return False
    
    print_header(f"Installing {name} Dependencies")
    print_info(f"Directory: {directory}")
    
    # Prepare npm install command
    cmd = ['npm', 'install']
    if use_legacy_peer_deps:
        cmd.append('--legacy-peer-deps')
        print_info("Using --legacy-peer-deps flag")
    
    try:
        # Run npm install
        process = subprocess.Popen(
            cmd,
            cwd=directory,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Print output in real-time
        for line in process.stdout:
            print(line, end='')
        
        # Wait for completion
        process.wait()
        
        if process.returncode == 0:
            print_success(f"{name} dependencies installed successfully!")
            return True
        else:
            print_error(f"Failed to install {name} dependencies (exit code: {process.returncode})")
            return False
            
    except Exception as e:
        print_error(f"Error installing {name} dependencies: {e}")
        return False


def main():
    """Main installation function"""
    parser = argparse.ArgumentParser(
        description='Install all npm dependencies for PROGEASE project',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument('--clean', action='store_true', 
                        help='Remove node_modules before installation')
    parser.add_argument('--no-root', action='store_true',
                        help='Skip root directory installation')
    parser.add_argument('--backend-only', action='store_true',
                        help='Install only backend dependencies')
    parser.add_argument('--frontend-only', action='store_true',
                        help='Install only frontend dependencies')
    
    args = parser.parse_args()
    
    # Print welcome message
    print_header("PROGEASE - Dependency Installation")
    print(f"{Colors.OKCYAN}This script will install all npm dependencies for the PROGEASE project.{Colors.ENDC}\n")
    
    # Check prerequisites
    if not check_prerequisites():
        sys.exit(1)
    
    # Get project root directory
    project_root = Path(__file__).parent.absolute()
    backend_dir = project_root / 'backend'
    frontend_dir = project_root / 'frontend'
    
    print_info(f"Project root: {project_root}")
    
    # Track installation success
    success = True
    
    # Clean if requested
    if args.clean:
        print_header("Cleaning node_modules Directories")
        if not args.backend_only and not args.frontend_only:
            clean_node_modules(str(project_root))
        if not args.frontend_only:
            clean_node_modules(str(backend_dir))
        if not args.backend_only:
            clean_node_modules(str(frontend_dir))
    
    # Install root dependencies
    if not args.no_root and not args.backend_only and not args.frontend_only:
        if not run_npm_install(str(project_root), "Root"):
            success = False
    
    # Install backend dependencies
    if not args.frontend_only:
        if not run_npm_install(str(backend_dir), "Backend"):
            success = False
    
    # Install frontend dependencies
    if not args.backend_only:
        # Frontend needs --legacy-peer-deps flag
        if not run_npm_install(str(frontend_dir), "Frontend", use_legacy_peer_deps=True):
            success = False
    
    # Print summary
    print_header("Installation Summary")
    
    if success:
        print_success("All dependencies installed successfully!")
        print_info("\nYou can now start the development servers:")
        print(f"  {Colors.OKCYAN}npm start{Colors.ENDC}         - Start both backend and frontend")
        print(f"  {Colors.OKCYAN}npm run dev{Colors.ENDC}       - Start backend in development mode")
        print(f"  {Colors.OKCYAN}cd frontend && npm start{Colors.ENDC} - Start frontend only")
        return 0
    else:
        print_error("Some dependencies failed to install.")
        print_info("Please check the error messages above and try again.")
        return 1


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print_warning("\n\nInstallation cancelled by user.")
        sys.exit(130)
    except Exception as e:
        print_error(f"\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

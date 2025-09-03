import os
import sys

# Ensure project root (parent of 'server') is on sys.path so 'server' can be imported
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


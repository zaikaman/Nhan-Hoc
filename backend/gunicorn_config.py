# -*- coding: utf-8 -*-
"""
Gunicorn configuration cho Heroku deployment
Đảm bảo UTF-8 encoding cho tất cả workers
"""
import os
import multiprocessing

# Server socket
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"
backlog = 2048

# Worker processes
workers = int(os.getenv('WEB_CONCURRENCY', multiprocessing.cpu_count() * 2 + 1))
worker_class = 'sync'
worker_connections = 1000
timeout = 120
keepalive = 2

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Process naming
proc_name = 'nhan-hoc-api'

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (if needed)
keyfile = None
certfile = None

# Đảm bảo UTF-8 encoding
def on_starting(server):
    """Called just before the master process is initialized."""
    import sys
    import locale
    
    # Force UTF-8 encoding
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    os.environ['LANG'] = 'en_US.UTF-8'
    os.environ['LC_ALL'] = 'en_US.UTF-8'
    
    # Reconfigure stdout/stderr
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
    if sys.stderr.encoding != 'utf-8':
        sys.stderr.reconfigure(encoding='utf-8')
    
    server.log.info("✓ UTF-8 encoding configured for Gunicorn")
    server.log.info(f"  stdout: {sys.stdout.encoding}")
    server.log.info(f"  stderr: {sys.stderr.encoding}")
    server.log.info(f"  default: {sys.getdefaultencoding()}")


def worker_init(worker):
    """Called just after a worker has been forked."""
    import sys
    
    # Ensure each worker uses UTF-8
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
    if sys.stderr.encoding != 'utf-8':
        sys.stderr.reconfigure(encoding='utf-8')
    
    worker.log.info(f"Worker {worker.pid} initialized with UTF-8 encoding")

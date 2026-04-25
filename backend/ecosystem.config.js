module.exports = {
    apps: [
        {
            name: 'clapp-backend',
            script: './src/server.js',
            instances: 'max', // Use all available CPUs (cluster mode)
            exec_mode: 'cluster',
            autorestart: true,
            watch: false,
            max_memory_restart: '300M',
            env: {
                NODE_ENV: 'production',
            },
            // Graceful shutdown
            kill_timeout: 5000,
            listen_timeout: 10000,
            // Restart on specific exit codes
            exp_backoff_restart_delay: 100,
            max_restarts: 10,
            min_uptime: '10s',
        },
    ],
};

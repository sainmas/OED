# This aggregates the readings data at hour level.
# This should be copied to /etc/ or /etc/cron.hourly/ or /etc/cron.daily and the copy renamed so that its function will be clear to admins.

# Check if a URL is provided as an argument
if [ -z "$1" ]; then
    echo "Error: No URL provided. Usage: $0"
    exit 1
fi

URL=$1

# The absolute path the project root directory (OED)
cd '/example/path/to/project/OED'

# The following line should NOT need to be edited except by devs or if you have an old system with only docker-compose.
docker compose run --rm web npm run --silent checkWebsiteStatus -- $URL &>> /dev/null &

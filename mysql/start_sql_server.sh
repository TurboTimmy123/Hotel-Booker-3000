#!/bin/bash

SQLDIR=$PWD/sql-data
INIT=0

printf '
╔══════════════════════════════════════════════════╗
║ WDC SQL Server Setup Script -- v1.1 October 2016 ║
╚══════════════════════════════════════════════════╝\n\n'
# Written by Ian Knight

if [ ! -d "$SQLDIR" ]; then
    # Database not setup yet, do install
    printf '\033[1;91mDatabase folder missing or moved...\033[0m\n'
    read -p "Do you want to setup a new database? [y/N] " -n 1 -r
    echo    # (optional) move to a new line
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir "$SQLDIR"
        printf '\n\033[1mInstalling SQL database files...\033[0m\n'
        mysql_install_db --no-defaults --basedir=/usr --datadir="$SQLDIR" --user=$USER
        INIT=1
    else
        printf '\n\033[1mExiting...\033[0m\n'
        printf 'If you were trying to start an existing database and are unsure\nwhy you received the message above, please try the following:\n'
        printf '* Ensure your current working directory is the same location as this script\ni.e. you are running ./start_sql_server.sh not somewhere-else/start_sql_server.sh\n'
        printf '* Ensure the folder sql-data is in the same folder/location as this script\nand has not been renamed or deleted.\n\n'
        printf "Don't forget to backup your Databases!\n"
        exit 0
  fi
  
fi

# Check if SQL Server running or exited uncleanly
# Wait up to 20s until sock & pid files created
printf 'Checking no existing sql processes running... '
COUNTER=0
STAGE=0
while [  $COUNTER -lt 20 ]; do
    if [ -e "$SQLDIR/mysql.sock" -o -e "$SQLDIR/mariadb.pid" ]; then
    
        if [ $STAGE = 0 -a $COUNTER = 0 ]; then
            printf '\n\033[1;91mSQL Server still running or exited uncleanly!\033[0m\n'
            printf 'Terminating existing sql processes... '
            killall -SIGTERM mysqld &> /dev/null
            STAGE=1
        elif [ $STAGE = 1 -a $COUNTER = 7 ]; then
            printf '\033[1;91mFAIL\033[0m\n'
            printf 'Forcibly killing existing sql processes... '
            killall -SIGKILL mysqld_safe &> /dev/null
            killall -SIGKILL mysqld &> /dev/null
            STAGE=2
        elif [ $STAGE = 2 -a $COUNTER = 15 ]; then
            printf '\033[1;91mFAIL\033[0m\n'
            printf 'Manually cleaning... '
            rm -f $SQLDIR/mysql.sock $SQLDIR/mariadb.pid &> /dev/null
            STAGE=3
        elif [ $COUNTER = 19 ]; then
            printf '\033[1;93mUnsuccessful. If sql server does not start, reboot your PC.\033[0m\n\n'
        fi
        sleep 1
        ((COUNTER++))
    else
        printf ' \033[1;92mOK\033[0m \n\n'
        COUNTER=20
    fi
done

# Function to stop running sql server
function stop_sql() {
    printf "\n\033[1mExiting...\033[0m\n"
    killall -SIGTERM mysqld
    # Wait up to 20s until sock & pid files removed
    COUNTER=0
    while [  $COUNTER -lt 20 ]; do
        if [ -e "$SQLDIR/mysql.sock" -o -e "$SQLDIR/mariadb.pid" ]; then
            sleep 1
            ((COUNTER++))
        else
            COUNTER=20
        fi
    done
    printf "Don't forget to backup your Databases!\n"
    SQLPID=0
}

# Start SQL Server
printf "\033[1mStarting SQL Server...\033[0m\n"
mysqld_safe --no-defaults --datadir="$SQLDIR" --log-error=mariadb.log --pid-file=mariadb.pid --socket=mysql.sock &
SQLPID=$!

# Stop sql server if SIGINT, SIGHUP or SIGTERM received
trap stop_sql SIGINT SIGHUP SIGTERM

# Wait up to 20s until sock & pid files created
COUNTER=0
while [  $COUNTER -lt 20 ]; do
    if [ -e "$SQLDIR/mysql.sock" -a -e "$SQLDIR/mariadb.pid" ]; then
        COUNTER=20
    else
        sleep 1
        ((COUNTER++))
    fi
done

# If sock & pid files have been created running okay, else exit
if [ -e "$SQLDIR/mysql.sock" -a -e "$SQLDIR/mariadb.pid" ]; then
    if [ $INIT = 1 ]; then
        # Finish initialising database
        printf '\033[1mFinalising install... \033[0m\nSetting up privileges... '
        echo -e "grant all privileges on *.* to ''@'localhost'; flush privileges;\n" | \
        mysql --no-defaults --socket="$SQLDIR/mysql.sock" --user=root
        printf ' \033[1;92mOK\033[0m \n\n'
    fi
    printf "\033[1;92mSQL Server Running.\033[0m\nIf you want to run another command line application while this is running, you will need to open a new Terminal.\nPress Ctrl+C to exit..."
else
    printf '\033[1;91mSQL Server Failed to start!\033[0m\n'
    stop_sql
fi

until [ $SQLPID = 0 ]; do
    sleep 1
done

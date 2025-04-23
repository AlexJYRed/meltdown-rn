# win_setup.ps1

# Get local IPv4 address (first non-loopback interface)
$ip = (Get-NetIPAddress -AddressFamily IPv4 `
      | Where-Object {$_.InterfaceAlias -notmatch 'Loopback'} `
      | Select-Object -First 1 -ExpandProperty IPAddress)

# Write to .env file
"EXPO_PUBLIC_SOCKET_URL=http://$ip`:3000" | Out-File -Encoding utf8 .env

Write-Host ".env generated with IP: $ip"

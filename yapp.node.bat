set T_ENV=test env str
echo running test
node yapp-test.js %1 %2 %3 %4 %5 %6 %7 %8 %9>yapp-test-out.txt
echo comparing results
fc yapp-test-gold.txt yapp-test-out.txt

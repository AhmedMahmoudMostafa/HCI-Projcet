import csv


csv_file_path = 'csv'




with open(csv_file_path, 'w') as csvfile:
        csv_writer = csv.writer(csvfile)
        
        # Write the header if needed
        # csv_writer.writerow(['X', 'Y'])

        # Write the eye gaze data
        csv_writer.writerows("12,12")
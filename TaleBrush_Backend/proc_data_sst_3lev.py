# TaleBrush 
# Copyright (c) 2022-present NAVER Corp.
# GPLv3

import numpy as np
import csv
import random




def proc_and_binarize(dir):
    fid = open(dir+ "/train.txt")
    train= fid.read()
    train = train.split("\n")[:-1]

    fid = open(dir+ "/test.txt")
    test = fid.read()
    test = test.split("\n")[:-1]
    # topics = ["world","sports","business","science"]
    sentiments = ['negative','25','neutral','75','positive']

    true_test = []
    false_test = []

    true_train = []
    false_train = []

    # range_arr = list(range(0,len(topics)))
    range_arr = list(range(0,len(sentiments)))


    for i in range(0,len(test)):
        if i==0:
            continue
        line = test[i].split('\t')
        label = line[0]


        if (len(line)<2):
            print("skipping! " +str(i))
            # print(line)
            continue
        

        if label[0] =="\"":
            label = label[1:-1]
        print('label:',label)
        label = int(label)
        text = line[1]
        if text[0] =="\"":
            text = text[1:-1]
        if text[0] == " ":
            text = text[1:]
        
        if label==1 or label==3:
            continue


        if label==0:
            choice_array = [2,4]
        # elif label==1:
        #     choice_array = [3,4]
        elif label==2:
            choice_array = [0,4]
        # elif label==3:
        #     choice_array = [0,1]
        elif label==4:
            choice_array = [0,2]

        # choice_array = range_arr[:label]+range_arr[label+1:]
        ps_label = random.choice(choice_array)
        print(choice_array)

        # true_ex = topics[label] + text
        # false_ex = topics[ps_label]  + text
        true_ex = sentiments[label] + text
        false_ex = sentiments[ps_label]  + text
        true_test.append(true_ex)
        false_test.append(false_ex)

    for i in range(0,len(train)):
        if i==0:
            continue
        print(train[i])
        line = train[i].split('\t')
        # print(len(line))
        if (len(line) <2):
            print("skipping!! " +str(i))
            # print(line)
            continue
        


        label = line[0]
        if label[0] =="\"":
            label = label[1:-1]
        print('label',label)
        label = int(label)
        text = line[1]
        if text[0] =="\"":
            text = text[1:-1]

        if text[0] == " ":
            text = text[1:]

        if label==1 or label==3:
            continue


        if label==0:
            choice_array = [2,4]
        # elif label==1:
        #     choice_array = [3,4]
        elif label==2:
            choice_array = [0,4]
        # elif label==3:
        #     choice_array = [0,1]
        elif label==4:
            choice_array = [0,2]

        ps_label = random.choice(choice_array)
        print(choice_array)

        true_ex = sentiments[label] +  text
        false_ex = sentiments[ps_label] +  text
        true_train.append(true_ex)
        false_train.append(false_ex)

    return true_train,false_train,true_test,false_test

def main():

    # fid = open("data/AG-news/train.csv")

    # text_train = fid.read()


    # fid  = open("data/AG-news/test.csv")
    # text_test = fid.read()
    # fid.close()


    # csv.writer(open("data/AG-news/train.tsv", 'w+'), delimiter='\t').writerows(csv.reader(open("data/AG-news/train.csv")))
    # csv.writer(open("data/AG-news/dev.tsv", 'w+'), delimiter='\t').writerows(csv.reader(open("data/AG-news/test.csv")))


    true_train, false_train, true_test, false_test = proc_and_binarize("./data/sst")
    random.shuffle(true_train)
    random.shuffle(false_train)
    random.shuffle(true_test)
    random.shuffle(false_test)


    false_lines = []
    true_lines = []
    for i in range(0,len(false_test)):
        false_lines.append(false_test[i] + "\t0" + "\n")
    for i in range(0,len(false_test)):
        true_lines.append(true_test[i] + "\t1" + "\n")

    test_lines = false_lines+true_lines
    random.shuffle(test_lines)

    false_lines = []
    true_lines = []
    for i in range(0,len(false_train)):
        false_lines.append(false_train[i] + "\t0" + "\n")
    for i in range(0,len(true_train)):
        true_lines.append(true_train[i] + "\t1" + "\n")

    train_lines = false_lines+true_lines
    random.shuffle(train_lines)

    train_split_all= "\n" + "".join(train_lines)
    test_split_all= "\n" + "".join(test_lines)


    fid = open("data/sst/train_p_delib_100.tsv",'w')
    fid.write(train_split_all)
    fid.close()

    fid = open("data/sst/dev_p_delib_100.tsv",'w')
    fid.write(test_split_all)
    fid.close()



main()
